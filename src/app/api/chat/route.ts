import { NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLLM } from "@/lib/llm";
import { hybridRetrieve } from "@/lib/retrieval";
import type { ChatMessage } from "@/types";

const SYSTEM_PROMPT = `You are Kwiz_y, an intelligent educational assistant. You help students understand their course materials by providing clear, accurate, and well-structured answers.

Rules:
1. Base your answer ONLY on the provided context from course materials
2. Cite your sources using [Source: document_name, page X] format
3. Match the language of the question (French question → French answer, Arabic → Arabic, etc.)
4. Provide clear explanations suitable for students
5. When relevant, mention related concepts the student might want to explore
6. If the context doesn't contain enough information, say so honestly
7. Structure your answer with clear paragraphs or bullet points when appropriate`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Retrieve relevant context
    const retrieval = await hybridRetrieve(message);

    // Build context string from retrieved chunks
    const contextParts = retrieval.chunks.map(
      (chunk, i) =>
        `[${i + 1}] Document: "${chunk.documentTitle}", Page ${chunk.pageNumber}\n${chunk.text}`
    );
    const context = contextParts.join("\n\n---\n\n");

    // Build graph context string
    const graphParts: string[] = [];
    if (retrieval.graphContext.concepts.length > 0) {
      graphParts.push(
        "Related concepts: " +
          retrieval.graphContext.concepts.map((c) => `${c.name} (${c.description})`).join(", ")
      );
    }
    if (retrieval.graphContext.relationships.length > 0) {
      graphParts.push(
        "Relationships: " +
          retrieval.graphContext.relationships
            .map((r) => `${r.source} → ${r.type} → ${r.target}`)
            .join("; ")
      );
    }
    const graphContext = graphParts.join("\n");

    // Build the full prompt
    const fullPrompt = `Context from course materials:
${context || "No relevant context found in uploaded documents."}

${graphContext ? `Knowledge graph context:\n${graphContext}\n` : ""}
Student's question: ${message}`;

    // Get LLM response
    const llm = getLLM({ temperature: 0.3, maxTokens: 2048 });
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(fullPrompt),
    ]);

    const answer = typeof response.content === "string" ? response.content : "";

    // Format sources for the response
    const sources = retrieval.chunks.slice(0, 5).map((chunk) => ({
      documentTitle: chunk.documentTitle,
      pageNumber: chunk.pageNumber,
      text: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? "..." : ""),
      score: chunk.score,
    }));

    return NextResponse.json({
      success: true,
      data: { answer, sources },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
