"""Hybrid retrieval: vector similarity search (turbovec) + knowledge graph traversal."""

from dataclasses import dataclass, field

from app.services.neo4j_service import run_query
from app.services.embeddings import generate_embedding
from app.services.vector_store import search as vector_store_search


@dataclass
class RetrievedChunk:
    id: str
    text: str
    page_number: int
    document_id: str
    document_title: str
    score: float


@dataclass
class GraphContext:
    concepts: list[dict] = field(default_factory=list)
    relationships: list[dict] = field(default_factory=list)


@dataclass
class RetrievalResult:
    chunks: list[RetrievedChunk]
    graph_context: GraphContext


async def hybrid_retrieve(query: str, top_k: int = 5) -> RetrievalResult:
    """Hybrid retrieval combining vector similarity with graph traversal."""
    # Step 1: Vector similarity search
    query_embedding = await generate_embedding(query)
    vector_results = await vector_search(query_embedding, top_k)

    # Step 2: Graph expansion
    graph_context = await expand_graph(vector_results)

    # Step 3: Get additional chunks from related concepts
    graph_chunks = await get_graph_chunks(graph_context.concepts, vector_results)

    # Merge and deduplicate
    all_chunks = deduplicate_chunks(vector_results + graph_chunks)

    return RetrievalResult(
        chunks=all_chunks[: top_k + 3],
        graph_context=graph_context,
    )


async def vector_search(embedding: list[float], top_k: int) -> list[RetrievedChunk]:
    """Vector similarity search using turbovec."""
    # Search turbovec index
    search_results = vector_store_search(embedding, top_k)

    if not search_results:
        return []

    # Get chunk metadata from Neo4j
    chunk_ids = [chunk_id for chunk_id, _ in search_results]
    score_map = {chunk_id: score for chunk_id, score in search_results}

    results = await run_query(
        """MATCH (doc:Document)-[:HAS_CHUNK]->(chunk:Chunk)
           WHERE chunk.id IN $chunk_ids
           RETURN chunk.id AS id, chunk.text AS text, chunk.pageNumber AS page_number,
                  chunk.documentId AS document_id, doc.title AS document_title""",
        {"chunk_ids": chunk_ids},
    )

    return [
        RetrievedChunk(
            id=r["id"],
            text=r["text"],
            page_number=r["page_number"],
            document_id=r["document_id"],
            document_title=r["document_title"],
            score=score_map.get(r["id"], 0.0),
        )
        for r in results
    ]


async def expand_graph(chunks: list[RetrievedChunk]) -> GraphContext:
    """Find concepts mentioned in retrieved chunks and their relationships."""
    if not chunks:
        return GraphContext()

    chunk_ids = [c.id for c in chunks]

    concept_results = await run_query(
        """MATCH (chunk:Chunk)-[:MENTIONS]->(c:Concept)
           WHERE chunk.id IN $chunk_ids
           RETURN DISTINCT c.name AS name, c.description AS description""",
        {"chunk_ids": chunk_ids},
    )

    concepts = [{"name": r["name"], "description": r["description"]} for r in concept_results]
    concept_names = [c["name"] for c in concepts]

    rel_results = await run_query(
        """MATCH (s:Concept)-[r]->(t:Concept)
           WHERE s.name IN $names AND t.name IN $names
           RETURN s.name AS source, t.name AS target, type(r) AS type""",
        {"names": concept_names},
    )

    relationships = [
        {"source": r["source"], "target": r["target"], "type": r["type"]}
        for r in rel_results
    ]

    return GraphContext(concepts=concepts, relationships=relationships)


async def get_graph_chunks(
    concepts: list[dict], existing_chunks: list[RetrievedChunk]
) -> list[RetrievedChunk]:
    """Get additional chunks that mention related concepts."""
    if not concepts:
        return []

    existing_ids = {c.id for c in existing_chunks}
    concept_names = [c["name"] for c in concepts]

    results = await run_query(
        """MATCH (c:Concept)<-[:MENTIONS]-(chunk:Chunk)<-[:HAS_CHUNK]-(doc:Document)
           WHERE c.name IN $names AND NOT chunk.id IN $existing_ids
           RETURN chunk.id AS id, chunk.text AS text, chunk.pageNumber AS page_number,
                  chunk.documentId AS document_id, doc.title AS document_title
           LIMIT 5""",
        {"names": concept_names, "existing_ids": list(existing_ids)},
    )

    return [
        RetrievedChunk(
            id=r["id"],
            text=r["text"],
            page_number=r["page_number"],
            document_id=r["document_id"],
            document_title=r["document_title"],
            score=0.5,
        )
        for r in results
    ]


def deduplicate_chunks(chunks: list[RetrievedChunk]) -> list[RetrievedChunk]:
    seen: set[str] = set()
    result = []
    for chunk in chunks:
        if chunk.id not in seen:
            seen.add(chunk.id)
            result.append(chunk)
    return result
