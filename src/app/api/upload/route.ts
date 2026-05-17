import { NextResponse } from "next/server";
import { parsePDF } from "@/lib/pdf-parser";
import { chunkDocument } from "@/lib/chunker";
import { generateEmbedding } from "@/lib/embeddings";
import { extractEntities, storeInGraph } from "@/lib/graph-builder";
import { runQuery } from "@/lib/neo4j";
import { config } from "@/config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const maxSize = config.upload.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${config.upload.maxFileSizeMB}MB limit` },
        { status: 400 }
      );
    }

    // Parse PDF (worker-free for server compatibility)
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { pages, totalPages, fullText } = await parsePDF(buffer);

    const documentId = crypto.randomUUID();
    const title = file.name.replace(/\.pdf$/i, "");

    // Store document node in Neo4j
    await runQuery(
      `CREATE (d:Document {
        id: $id,
        title: $title,
        filename: $filename,
        language: $language,
        uploadedAt: datetime(),
        pageCount: $pageCount,
        status: 'processing'
      })`,
      {
        id: documentId,
        title,
        filename: file.name,
        language: detectLanguage(fullText),
        pageCount: totalPages,
      }
    );

    // Chunk the document
    const chunks = chunkDocument(pages, documentId, {
      chunkSize: config.chunking.chunkSize,
      chunkOverlap: config.chunking.chunkOverlap,
    });

    // Process each chunk: embed, extract entities, store
    for (const chunk of chunks) {
      const chunkId = `${documentId}_chunk_${chunk.index}`;

      // Generate embedding
      const embedding = await generateEmbedding(chunk.text);

      // Store chunk in Neo4j with embedding
      await runQuery(
        `MATCH (d:Document {id: $documentId})
         CREATE (c:Chunk {
           id: $chunkId,
           text: $text,
           pageNumber: $pageNumber,
           chunkIndex: $chunkIndex,
           documentId: $documentId,
           embedding: $embedding
         })
         CREATE (d)-[:HAS_CHUNK]->(c)`,
        {
          documentId,
          chunkId,
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.index,
          embedding,
        }
      );

      // Extract entities and store in graph
      const extraction = await extractEntities(chunk.text);
      if (extraction.concepts.length > 0) {
        await storeInGraph(extraction, chunkId, documentId);
      }
    }

    // Update document status
    await runQuery(
      `MATCH (d:Document {id: $id})
       SET d.status = 'ready', d.chunkCount = $chunkCount`,
      { id: documentId, chunkCount: chunks.length }
    );

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        title,
        pageCount: totalPages,
        chunkCount: chunks.length,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Simple language detection based on character analysis.
 */
function detectLanguage(text: string): string {
  const sample = text.slice(0, 1000);

  // Check for Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(sample)) return "ar";

  // Check for French-specific characters and common words
  const frenchIndicators = /[àâçéèêëîïôùûüÿœæ]|(\b(le|la|les|de|du|des|un|une|est|sont|dans|pour|avec|sur|par)\b)/i;
  if (frenchIndicators.test(sample)) return "fr";

  return "en";
}
