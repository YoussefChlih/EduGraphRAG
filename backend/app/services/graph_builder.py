"""Knowledge graph construction: entity/relation extraction via LLM, storage in Neo4j."""

import json
import re
from dataclasses import dataclass

from langchain_core.messages import SystemMessage, HumanMessage

from app.services.llm import get_llm
from app.services.neo4j_service import run_query


@dataclass
class ExtractedConcept:
    name: str
    description: str


@dataclass
class ExtractedRelation:
    source: str
    target: str
    type: str  # RELATED_TO, PREREQUISITE_OF, PART_OF, EXAMPLE_OF, CONTRASTS_WITH


@dataclass
class ExtractionResult:
    concepts: list[ExtractedConcept]
    relationships: list[ExtractedRelation]


EXTRACTION_PROMPT = """You are an expert educational content analyst. Given a text chunk from an academic document, extract:

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
- If no clear concepts are found, return empty arrays"""

VALID_RELATION_TYPES = {"RELATED_TO", "PREREQUISITE_OF", "PART_OF", "EXAMPLE_OF", "CONTRASTS_WITH"}


async def extract_entities(text: str) -> ExtractionResult:
    """Extract concepts and relationships from a text chunk using LLM."""
    llm = get_llm(temperature=0, max_tokens=2048)

    response = await llm.ainvoke([
        SystemMessage(content=EXTRACTION_PROMPT),
        HumanMessage(content=text),
    ])

    content = response.content if isinstance(response.content, str) else ""

    try:
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r"\{[\s\S]*\}", content)
        if not json_match:
            return ExtractionResult(concepts=[], relationships=[])

        parsed = json.loads(json_match.group())

        concepts = [
            ExtractedConcept(name=c["name"], description=c.get("description", ""))
            for c in parsed.get("concepts", [])
            if "name" in c
        ]

        relationships = [
            ExtractedRelation(source=r["source"], target=r["target"], type=r["type"])
            for r in parsed.get("relationships", [])
            if "source" in r and "target" in r and r.get("type") in VALID_RELATION_TYPES
        ]

        return ExtractionResult(concepts=concepts, relationships=relationships)

    except (json.JSONDecodeError, KeyError, TypeError):
        return ExtractionResult(concepts=[], relationships=[])


async def store_in_graph(extraction: ExtractionResult, chunk_id: str, document_id: str):
    """Store extracted concepts and relationships in Neo4j."""
    for concept in extraction.concepts:
        await run_query(
            """MERGE (c:Concept {name: $name})
               ON CREATE SET c.description = $description, c.createdAt = datetime()
               WITH c
               MATCH (chunk:Chunk {id: $chunk_id})
               MERGE (chunk)-[:MENTIONS]->(c)""",
            {"name": concept.name, "description": concept.description, "chunk_id": chunk_id},
        )

    for rel in extraction.relationships:
        # Use parameterized relationship type via APOC or separate queries per type
        await run_query(
            f"""MATCH (source:Concept {{name: $source}})
                MATCH (target:Concept {{name: $target}})
                MERGE (source)-[:{rel.type}]->(target)""",
            {"source": rel.source, "target": rel.target},
        )
