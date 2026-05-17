import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";

export async function GET() {
  try {
    const results = await runQuery<{
      d: {
        id: string;
        title: string;
        filename: string;
        language: string;
        uploadedAt: string;
        pageCount: number;
        chunkCount: number;
        status: string;
      };
    }>(
      `MATCH (d:Document)
       RETURN d { .id, .title, .filename, .language, .uploadedAt, .pageCount, .chunkCount, .status }
       ORDER BY d.uploadedAt DESC`
    );

    const documents = results.map((r) => r.d);

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Documents list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
