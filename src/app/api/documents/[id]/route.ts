import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/documents/[id]">
) {
  try {
    const { id } = await ctx.params;

    // Delete all chunks and their relationships, then the document
    await runQuery(
      `MATCH (d:Document {id: $id})
       OPTIONAL MATCH (d)-[:HAS_CHUNK]->(c:Chunk)
       OPTIONAL MATCH (c)-[:MENTIONS]->(concept:Concept)
       DETACH DELETE c
       WITH d
       DETACH DELETE d`,
      { id }
    );

    // Clean up orphaned concepts (concepts with no remaining chunk references)
    await runQuery(
      `MATCH (c:Concept)
       WHERE NOT (c)<-[:MENTIONS]-()
       DETACH DELETE c`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
