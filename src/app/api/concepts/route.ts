import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";

export async function GET() {
  try {
    const results = await runQuery<{
      concept: { name: string; description: string };
      documentCount: number;
      relatedConcepts: string[];
    }>(
      `MATCH (c:Concept)
       OPTIONAL MATCH (c)<-[:MENTIONS]-(chunk:Chunk)<-[:HAS_CHUNK]-(d:Document)
       WITH c, count(DISTINCT d) AS docCount
       OPTIONAL MATCH (c)-[:RELATED_TO|PREREQUISITE_OF|PART_OF]-(related:Concept)
       RETURN c { .name, .description } AS concept,
              docCount AS documentCount,
              collect(DISTINCT related.name)[..5] AS relatedConcepts
       ORDER BY docCount DESC
       LIMIT 100`
    );

    const concepts = results.map((r) => ({
      name: r.concept.name,
      description: r.concept.description,
      documentCount: r.documentCount,
      relatedConcepts: r.relatedConcepts,
    }));

    return NextResponse.json({ success: true, data: concepts });
  } catch (error) {
    console.error("Concepts fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch concepts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
