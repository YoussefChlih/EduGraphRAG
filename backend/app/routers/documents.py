"""Document management endpoints."""

from fastapi import APIRouter, HTTPException

from app.services.neo4j_service import run_query
from app.services.vector_store import remove_document_vectors

router = APIRouter()


@router.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    try:
        results = await run_query(
            """MATCH (d:Document)
               RETURN d.id AS id, d.title AS title, d.filename AS filename,
                      d.language AS language, d.uploadedAt AS uploaded_at,
                      d.pageCount AS page_count, d.chunkCount AS chunk_count,
                      d.status AS status
               ORDER BY d.uploadedAt DESC"""
        )
        return {"success": True, "data": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and all its associated data."""
    try:
        # Remove vectors from turbovec
        remove_document_vectors(document_id)

        # Delete chunks and their relationships, then the document
        await run_query(
            """MATCH (d:Document {id: $id})
               OPTIONAL MATCH (d)-[:HAS_CHUNK]->(c:Chunk)
               OPTIONAL MATCH (c)-[:MENTIONS]->(concept:Concept)
               DETACH DELETE c
               WITH d
               DETACH DELETE d""",
            {"id": document_id},
        )

        # Clean up orphaned concepts
        await run_query(
            """MATCH (c:Concept)
               WHERE NOT (c)<-[:MENTIONS]-()
               DETACH DELETE c"""
        )

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
