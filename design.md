# System Design Document

## Overview
Kwiz_y is a multilingual educational GraphRAG platform that combines Knowledge Graphs, semantic vector search, and LLMs to provide intelligent, contextual answers grounded in course materials.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Upload  │  │   Chat   │  │  Graph   │              │
│  │   Page   │  │Interface │  │ Explorer │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────┬───────────────────────────────┘
                          │ API Routes
┌─────────────────────────┴───────────────────────────────┐
│                  Backend (Next.js API)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Upload  │  │ Retrieval│  │   Chat   │              │
│  │ Pipeline │  │  Engine  │  │  Engine  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                   Core Libraries                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Chunker │ │Embedder│ │ Graph  │ │  LLM   │          │
│  │        │ │        │ │Builder │ │ Client │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                   External Services                       │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Neo4j AuraDB │  │ Groq API │  │OpenAI API│          │
│  │(Graph+Vector)│  │  (LLM)   │  │(Fallback)│          │
│  └──────────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Document Ingestion Pipeline
```
PDF Upload → Parse (pdf-parse) → Clean Text → Chunk (recursive splitter)
    → Generate Embeddings (BGE-M3) → Extract Entities & Relations (LLM)
    → Store in Neo4j (nodes + relationships + vector index)
```

### 2. Query Pipeline (Hybrid GraphRAG)
```
User Question → Embed Query → Vector Search (top-k similar chunks)
    → Graph Traversal (related concepts via relationships)
    → Merge & Rank Results → Build Context Prompt
    → LLM Generation → Response with Citations
```

## Data Models

### Neo4j Node Types
- **Document**: `{id, title, filename, language, uploadedAt, pageCount}`
- **Chunk**: `{id, text, embedding[], pageNumber, chunkIndex, documentId}`
- **Concept**: `{id, name, description, language}`

### Neo4j Relationship Types
- `(:Document)-[:HAS_CHUNK]->(:Chunk)`
- `(:Chunk)-[:MENTIONS]->(:Concept)`
- `(:Concept)-[:RELATED_TO]->(:Concept)`
- `(:Concept)-[:PREREQUISITE_OF]->(:Concept)`
- `(:Concept)-[:PART_OF]->(:Concept)`
- `(:Chunk)-[:NEXT]->(:Chunk)` (sequential ordering)

### Vector Index
- Index name: `chunk_embeddings`
- Dimensions: 1024 (BGE-M3) or 768 (multilingual-e5)
- Similarity: cosine

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload and process a PDF document |
| GET | `/api/documents` | List all uploaded documents |
| POST | `/api/chat` | Send a question, get RAG response |
| GET | `/api/graph` | Get graph data for visualization |
| GET | `/api/concepts` | List extracted concepts |
| DELETE | `/api/documents/[id]` | Remove a document and its data |

## Chunking Strategy
- Method: Recursive character text splitter
- Chunk size: 512 tokens
- Overlap: 50 tokens
- Metadata preserved: page number, document ID, chunk index

## Retrieval Strategy (Hybrid)
1. **Vector search**: Find top-k (k=5) most similar chunks by cosine similarity
2. **Graph expansion**: For each retrieved chunk, traverse 1-2 hops to find related concepts and their chunks
3. **Re-ranking**: Score results by relevance (vector similarity + graph proximity)
4. **Context assembly**: Build prompt with ranked chunks + relationship context

## Multilingual Approach
- Embedding model supports EN, FR, AR natively (BGE-M3 is trained on 100+ languages)
- Entity extraction prompts are language-aware
- UI supports RTL layout for Arabic
- Queries in any supported language retrieve relevant content regardless of source language

## Security Considerations
- File upload validation (PDF only, max 20MB)
- Rate limiting on API routes
- Environment variables for all API keys
- No PII stored beyond uploaded documents

## Performance Targets
- Document processing: < 60s for a 50-page PDF
- Query response: < 5s end-to-end
- Graph visualization: < 2s for up to 200 nodes
