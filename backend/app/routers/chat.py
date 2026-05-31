"""Chat endpoint with hybrid GraphRAG retrieval."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from langchain_core.messages import SystemMessage, HumanMessage

from app.services.llm import get_llm
from app.services.retrieval import hybrid_retrieve, RetrievalResult, GraphContext

router = APIRouter()

SYSTEM_PROMPT = """You are Kwiz_y, an intelligent educational assistant. You help students understand their course materials by providing clear, accurate, and well-structured answers.

Rules:
1. Base your answer ONLY on the provided context from course materials
2. Cite your sources using [Source: document_name, page X] format
3. Match the language of the question (French question → French answer, Arabic → Arabic, etc.)
4. Provide clear explanations suitable for students
5. When relevant, mention related concepts the student might want to explore
6. If the context doesn't contain enough information, say so honestly
7. Structure your answer with clear paragraphs or bullet points when appropriate"""


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None


@router.post("/chat")
async def chat(request: ChatRequest):
    """Send a question, get a RAG-powered response with citations."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        # Retrieve relevant context (degrade gracefully if retrieval fails)
        try:
            retrieval = await hybrid_retrieve(request.message)
        except Exception as retrieval_error:
            # Retrieval depends on external services (embeddings API, Neo4j).
            # If they're unavailable, still answer with the LLM rather than failing.
            print(f"[chat] retrieval failed, continuing without context: {retrieval_error}")
            retrieval = RetrievalResult(chunks=[], graph_context=GraphContext())

        # Build context string
        context_parts = [
            f'[{i + 1}] Document: "{chunk.document_title}", Page {chunk.page_number}\n{chunk.text}'
            for i, chunk in enumerate(retrieval.chunks)
        ]
        context = "\n\n---\n\n".join(context_parts)

        # Build graph context
        graph_parts = []
        if retrieval.graph_context.concepts:
            graph_parts.append(
                "Related concepts: "
                + ", ".join(
                    f"{c['name']} ({c['description']})" for c in retrieval.graph_context.concepts
                )
            )
        if retrieval.graph_context.relationships:
            graph_parts.append(
                "Relationships: "
                + "; ".join(
                    f"{r['source']} → {r['type']} → {r['target']}"
                    for r in retrieval.graph_context.relationships
                )
            )
        graph_context = "\n".join(graph_parts)

        # Build full prompt
        full_prompt = f"""Context from course materials:
{context or "No relevant context found in uploaded documents."}

{f"Knowledge graph context:\\n{graph_context}\\n" if graph_context else ""}
Student's question: {request.message}"""

        # Get LLM response
        llm = get_llm(temperature=0.3, max_tokens=2048)
        response = await llm.ainvoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=full_prompt),
        ])

        answer = response.content if isinstance(response.content, str) else ""

        # Format sources
        sources = [
            {
                "document_title": chunk.document_title,
                "page_number": chunk.page_number,
                "text": chunk.text[:200] + ("..." if len(chunk.text) > 200 else ""),
                "score": chunk.score,
            }
            for chunk in retrieval.chunks[:5]
        ]

        return {"success": True, "data": {"answer": answer, "sources": sources}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
