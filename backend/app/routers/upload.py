"""PDF upload and processing endpoint."""

import re
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import settings
from app.services.pdf_parser import parse_pdf
from app.services.chunker import chunk_document
from app.services.embeddings import generate_embedding
from app.services.graph_builder import extract_entities, store_in_graph
from app.services.neo4j_service import run_query
from app.services.vector_store import add_vector

router = APIRouter()


def detect_language(text: str) -> str:
    """Simple language detection based on character analysis."""
    sample = text[:1000]

    # Arabic characters
    if re.search(r"[\u0600-\u06FF]", sample):
        return "ar"

    # French indicators
    if re.search(
        r"[àâçéèêëîïôùûüÿœæ]|(\b(le|la|les|de|du|des|un|une|est|sont|dans|pour|avec|sur|par)\b)",
        sample,
        re.IGNORECASE,
    ):
        return "fr"

    return "en"


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document."""
    # Validate file
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read file
    file_bytes = await file.read()
    max_size = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size_mb}MB limit",
        )

    try:
        # Parse PDF
        pdf_data = parse_pdf(file_bytes)

        document_id = str(uuid.uuid4())
        title = file.filename.rsplit(".", 1)[0] if file.filename else "Untitled"

        # Store document in Neo4j
        await run_query(
            """CREATE (d:Document {
                id: $id,
                title: $title,
                filename: $filename,
                language: $language,
                uploadedAt: datetime(),
                pageCount: $page_count,
                status: 'processing'
            })""",
            {
                "id": document_id,
                "title": title,
                "filename": file.filename,
                "language": detect_language(pdf_data["full_text"]),
                "page_count": pdf_data["total_pages"],
            },
        )

        # Chunk the document
        chunks = chunk_document(pdf_data["pages"], document_id)

        # Process each chunk
        for chunk in chunks:
            chunk_id = f"{document_id}_chunk_{chunk.index}"

            # Generate embedding
            embedding = await generate_embedding(chunk.text)

            # Store chunk in Neo4j (without embedding - vector search is handled by turbovec)
            await run_query(
                """MATCH (d:Document {id: $document_id})
                   CREATE (c:Chunk {
                       id: $chunk_id,
                       text: $text,
                       pageNumber: $page_number,
                       chunkIndex: $chunk_index,
                       documentId: $document_id
                   })
                   CREATE (d)-[:HAS_CHUNK]->(c)""",
                {
                    "document_id": document_id,
                    "chunk_id": chunk_id,
                    "text": chunk.text,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.index,
                },
            )

            # Store embedding in turbovec
            add_vector(chunk_id, embedding)

            # Extract entities and store in graph
            extraction = await extract_entities(chunk.text)
            if extraction.concepts:
                await store_in_graph(extraction, chunk_id, document_id)

        # Update document status
        await run_query(
            """MATCH (d:Document {id: $id})
               SET d.status = 'ready', d.chunkCount = $chunk_count""",
            {"id": document_id, "chunk_count": len(chunks)},
        )

        return {
            "success": True,
            "data": {
                "document_id": document_id,
                "title": title,
                "page_count": pdf_data["total_pages"],
                "chunk_count": len(chunks),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
