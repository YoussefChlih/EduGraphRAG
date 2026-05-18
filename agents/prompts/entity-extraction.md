# Entity Extraction Prompt

## Purpose

Used by the LLM to extract educational concepts and their relationships from text chunks during the document ingestion pipeline. This prompt is called once per chunk.

## Implementation

Located in: `backend/app/services/graph_builder.py`
Called by: `backend/app/routers/upload.py` during document processing

## System Prompt

```
You are an expert educational content analyst. Given a text chunk from an academic document, extract:

1. Concepts: Key educational concepts, terms, theories, or topics mentioned.
2. Relationships: How these concepts relate to each other.

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
- If no clear concepts are found, return empty arrays
```

## Supported Languages

- English
- French
- Arabic

## Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| RELATED_TO | General association | "Machine Learning" - "Statistics" |
| PREREQUISITE_OF | Required knowledge | "Linear Algebra" - "Neural Networks" |
| PART_OF | Component relationship | "Backpropagation" - "Training" |
| EXAMPLE_OF | Instance of a concept | "CNN" - "Neural Network" |
| CONTRASTS_WITH | Opposing or alternative | "Supervised" - "Unsupervised" |

## Design Notes

- The prompt is language-agnostic: it instructs the LLM to preserve the original language of concepts
- Relationship types are standardized in English for graph query consistency
- Chunk metadata (page number, document ID) is added programmatically after extraction
- The LLM used for extraction is llama-3.1-8b-instant (fast, cost-effective)
- JSON parsing includes fallback handling for markdown code blocks in LLM output
