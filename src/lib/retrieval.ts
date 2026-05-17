import { runQuery } from "./neo4j";
import { generateEmbedding } from "./embeddings";

export interface RetrievedChunk {
  id: string;
  text: string;
  pageNumber: number;
  documentId: string;
  documentTitle: string;
  score: number;
}

export interface GraphContext {
  concepts: { name: string; description: string }[];
  relationships: { source: string; target: string; type: string }[];
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  graphContext: GraphContext;
}

/**
 * Hybrid retrieval: combines vector similarity search with graph traversal.
 */
export async function hybridRetrieve(
  query: string,
  topK: number = 5
): Promise<RetrievalResult> {
  // Step 1: Vector similarity search
  const queryEmbedding = await generateEmbedding(query);
  const vectorResults = await vectorSearch(queryEmbedding, topK);

  // Step 2: Graph expansion — find related concepts from retrieved chunks
  const graphContext = await expandGraph(vectorResults);

  // Step 3: Get additional chunks from related concepts (1-hop)
  const graphChunks = await getGraphChunks(graphContext.concepts, vectorResults);

  // Merge and deduplicate
  const allChunks = deduplicateChunks([...vectorResults, ...graphChunks]);

  return {
    chunks: allChunks.slice(0, topK + 3), // Allow a few extra from graph
    graphContext,
  };
}

/**
 * Vector similarity search using Neo4j vector index.
 */
async function vectorSearch(
  embedding: number[],
  topK: number
): Promise<RetrievedChunk[]> {
  const results = await runQuery<{
    chunk: { id: string; text: string; pageNumber: number; documentId: string };
    doc: { title: string };
    score: number;
  }>(
    `CALL db.index.vector.queryNodes('chunk_embeddings', $topK, $embedding)
     YIELD node AS chunk, score
     MATCH (doc:Document)-[:HAS_CHUNK]->(chunk)
     RETURN chunk { .id, .text, .pageNumber, .documentId }, doc { .title }, score
     ORDER BY score DESC`,
    { topK, embedding }
  );

  return results.map((r) => ({
    id: r.chunk.id,
    text: r.chunk.text,
    pageNumber: r.chunk.pageNumber,
    documentId: r.chunk.documentId,
    documentTitle: r.doc.title,
    score: r.score,
  }));
}

/**
 * Expand the graph by finding concepts mentioned in retrieved chunks
 * and their relationships.
 */
async function expandGraph(chunks: RetrievedChunk[]): Promise<GraphContext> {
  if (chunks.length === 0) {
    return { concepts: [], relationships: [] };
  }

  const chunkIds = chunks.map((c) => c.id);

  const conceptResults = await runQuery<{
    concept: { name: string; description: string };
  }>(
    `MATCH (chunk:Chunk)-[:MENTIONS]->(c:Concept)
     WHERE chunk.id IN $chunkIds
     RETURN DISTINCT c { .name, .description } AS concept`,
    { chunkIds }
  );

  const concepts = conceptResults.map((r) => r.concept);
  const conceptNames = concepts.map((c) => c.name);

  const relResults = await runQuery<{
    source: string;
    target: string;
    type: string;
  }>(
    `MATCH (s:Concept)-[r]->(t:Concept)
     WHERE s.name IN $names AND t.name IN $names
     RETURN s.name AS source, t.name AS target, type(r) AS type`,
    { names: conceptNames }
  );

  return {
    concepts,
    relationships: relResults,
  };
}

/**
 * Get additional chunks that mention related concepts (graph-based retrieval).
 */
async function getGraphChunks(
  concepts: { name: string; description: string }[],
  existingChunks: RetrievedChunk[]
): Promise<RetrievedChunk[]> {
  if (concepts.length === 0) return [];

  const existingIds = new Set(existingChunks.map((c) => c.id));
  const conceptNames = concepts.map((c) => c.name);

  const results = await runQuery<{
    chunk: { id: string; text: string; pageNumber: number; documentId: string };
    doc: { title: string };
  }>(
    `MATCH (c:Concept)<-[:MENTIONS]-(chunk:Chunk)<-[:HAS_CHUNK]-(doc:Document)
     WHERE c.name IN $names AND NOT chunk.id IN $existingIds
     RETURN chunk { .id, .text, .pageNumber, .documentId }, doc { .title }
     LIMIT 5`,
    { names: conceptNames, existingIds: Array.from(existingIds) }
  );

  return results.map((r) => ({
    id: r.chunk.id,
    text: r.chunk.text,
    pageNumber: r.chunk.pageNumber,
    documentId: r.chunk.documentId,
    documentTitle: r.doc.title,
    score: 0.5, // Lower score for graph-retrieved chunks
  }));
}

function deduplicateChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    if (seen.has(chunk.id)) return false;
    seen.add(chunk.id);
    return true;
  });
}
