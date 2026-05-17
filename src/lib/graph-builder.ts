import { getLLM } from "./llm";
import { runQuery } from "./neo4j";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface ExtractedConcept {
  name: string;
  description: string;
}

export interface ExtractedRelation {
  source: string;
  target: string;
  type: "RELATED_TO" | "PREREQUISITE_OF" | "PART_OF" | "EXAMPLE_OF" | "CONTRASTS_WITH";
}

export interface ExtractionResult {
  concepts: ExtractedConcept[];
  relationships: ExtractedRelation[];
}

const EXTRACTION_PROMPT = `You are an expert educational content analyst. Given a text chunk from an academic document, extract:

1. **Concepts**: Key educational concepts, terms, theories, or topics mentioned.
2. **Relationships**: How these concepts relate to each other.

For each concept, provide:
- name: The concept name (in the original language of the text)
- description: A brief description (1-2 sentences)

For each relationship, provide:
- source: Source concept name
- target: Target concept name
- type: One of [RELATED_TO, PREREQUISITE_OF, PART_OF, EXAMPLE_OF, CONTRASTS_WITH]

Respond ONLY with valid JSON in this exact format:
{
  "concepts": [{"name": "...", "description": "..."}],
  "relationships": [{"source": "...", "target": "...", "type": "..."}]
}

Important:
- Extract concepts in the ORIGINAL language of the text
- Focus on educational/academic concepts, not generic words
- Limit to 5-10 concepts per chunk
- Only include relationships you are confident about
- If no clear concepts are found, return empty arrays`;

/**
 * Extract concepts and relationships from a text chunk using LLM.
 */
export async function extractEntities(text: string): Promise<ExtractionResult> {
  const llm = getLLM({ temperature: 0, maxTokens: 2048 });

  const response = await llm.invoke([
    new SystemMessage(EXTRACTION_PROMPT),
    new HumanMessage(text),
  ]);

  const content = typeof response.content === "string" ? response.content : "";

  try {
    // Try to parse JSON from the response, handling potential markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { concepts: [], relationships: [] };
    }
    const parsed = JSON.parse(jsonMatch[0]) as ExtractionResult;
    return {
      concepts: parsed.concepts || [],
      relationships: parsed.relationships || [],
    };
  } catch {
    console.error("Failed to parse extraction result:", content);
    return { concepts: [], relationships: [] };
  }
}

/**
 * Store extracted concepts and relationships in Neo4j.
 */
export async function storeInGraph(
  extraction: ExtractionResult,
  chunkId: string,
  documentId: string
): Promise<void> {
  // Create concept nodes and link them to the chunk
  for (const concept of extraction.concepts) {
    await runQuery(
      `MERGE (c:Concept {name: $name})
       ON CREATE SET c.description = $description, c.createdAt = datetime()
       WITH c
       MATCH (chunk:Chunk {id: $chunkId})
       MERGE (chunk)-[:MENTIONS]->(c)`,
      { name: concept.name, description: concept.description, chunkId }
    );
  }

  // Create relationships between concepts
  for (const rel of extraction.relationships) {
    await runQuery(
      `MATCH (source:Concept {name: $source})
       MATCH (target:Concept {name: $target})
       MERGE (source)-[:${rel.type}]->(target)`,
      { source: rel.source, target: rel.target }
    );
  }
}
