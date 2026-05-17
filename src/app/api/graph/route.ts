import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import type { GraphData } from "@/types";

export async function GET() {
  try {
    // Fetch all concepts
    const conceptResults = await runQuery<{
      c: { name: string; description: string };
    }>(
      `MATCH (c:Concept)
       RETURN c { .name, .description }
       LIMIT 200`
    );

    // Fetch all relationships between concepts
    const relResults = await runQuery<{
      source: string;
      target: string;
      type: string;
    }>(
      `MATCH (s:Concept)-[r]->(t:Concept)
       RETURN s.name AS source, t.name AS target, type(r) AS type
       LIMIT 500`
    );

    const graphData: GraphData = {
      nodes: conceptResults.map((r) => ({
        id: r.c.name,
        label: r.c.name,
        type: "concept",
        description: r.c.description,
      })),
      edges: relResults.map((r) => ({
        source: r.source,
        target: r.target,
        type: r.type,
        label: r.type.replace(/_/g, " ").toLowerCase(),
      })),
    };

    return NextResponse.json({ success: true, data: graphData });
  } catch (error) {
    console.error("Graph fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch graph data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
