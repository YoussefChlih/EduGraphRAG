# System Design Document

## Overview

EduGraphRAG is a multilingual educational platform that combines Knowledge Graphs, semantic vector search, and Large Language Models to provide intelligent, contextual answers grounded in course materials.

## System Architecture

```
+-----------------------------------------------------------+
|                  Frontend (Next.js)                         |
|   +----------+   +----------+   +----------+              |
|   |  Upload  |   |   Chat   |   |  Graph   |              |
|   |   Page   |   | Interface|   | Explorer |              |
|   +----------+   +----------+   +----------+              |
+---------------------------+-------------------------------+
                            | HTTP (fetch)
                            v
+-----------------------------------------------------------+
|                  Backend (FastAPI)                          |
|   +----------+   +----------+   +----------+              |
|   |  Upload  |   | Retrieval|   |   Chat   |              |
|   |  Router  |   |  Service |   |  Router  |              |
|   +----------+   +----------+   +----------+              |
|                                                           |
|   +--------+ +--------+ +--------+ +--------+            |
|   |Chunker | |Embedder| | Graph  | |  LLM   |            |
|   |        | |        | |Builder | | Client |            |
|   +--------+ +--------+ +--------+ +--------+            |
+---------------------------+-------------------------------+
                            |
                            v
+-----------------------------------------------------------+
|                  External Services                          |
|   +--------------+   +----------+   +----------+          |
|   | Neo4j AuraDB |   | Groq API |   |OpenAI API|          |
|   | (Graph Only) |   |  (LLM)   |   |(Fallback)|          |
|   +--------------+   +----------+   +----------+          |
|   +------------------+   +------------------+              |
|   | turbovec (local) |   | HuggingFace API  |              |
|   | (Vector Search)  |   |  (Embeddings)    |              |
|   +------------------+   +------------------+              |
+-----------------------------------------------------------+
```

## Data Flow

### Document Ingestion Pipeline

```
PDF Upload (multipart/form-data)
    |
    v
PDF Parsing (PyMuPDF) -- extract per-page text
    |
    v
Text Cleaning -- normalize whitespace, remove artifacts
    |
    v
Recursive Chunking -- 512 chars, 50 overlap, smart boundaries
    |
    v
Embedding Generation -- BGE-M3 via HuggingFace Inference Providers router (1024 dims)
    |
    v
Vector Indexing -- turbovec (4-bit TurboQuant, local persistence)
    |
    v
Entity Extraction -- LLM identifies concepts and relationships
    |
    v
Neo4j Storage -- Document, Chunk, Concept nodes + relationships
```

### Query Pipeline (Hybrid GraphRAG)

```
User Question
    |
    v
Query Embedding -- BGE-M3 (same model as ingestion)
    |
    v
Vector Search -- top-k similar chunks via turbovec (local, SIMD-accelerated)
    |
    v
Graph Expansion -- traverse 1-2 hops from retrieved chunks to find related concepts
    |
    v
Merge and Deduplicate -- combine vector and graph results
    |
    v
Context Assembly -- format chunks + graph context into prompt
    |
    v
LLM Generation -- produce answer with source citations
```

## Data Models

### Neo4j Node Types

Document:
- id (string, UUID)
- title (string)
- filename (string)
- language (string: en, fr, ar)
- uploadedAt (datetime)
- pageCount (integer)
- chunkCount (integer)
- status (string: processing, ready, error)

Chunk:
- id (string, document_id + chunk index)
- text (string)
- pageNumber (integer)
- chunkIndex (integer)
- documentId (string)

Concept:
- name (string, in original language)
- description (string)
- createdAt (datetime)

### Neo4j Relationship Types

- (Document)-[:HAS_CHUNK]->(Chunk)
- (Chunk)-[:MENTIONS]->(Concept)
- (Concept)-[:RELATED_TO]->(Concept)
- (Concept)-[:PREREQUISITE_OF]->(Concept)
- (Concept)-[:PART_OF]->(Concept)
- (Concept)-[:EXAMPLE_OF]->(Concept)
- (Concept)-[:CONTRASTS_WITH]->(Concept)

### Vector Index

- Engine: turbovec (TurboQuant-based, Rust with Python bindings)
- Storage: Local file (IdMapIndex, .tvim format)
- Dimensions: 1024
- Quantization: 4-bit (16x compression vs float32)
- Similarity: Inner product (normalized vectors → cosine equivalent)
- Persistence: ./data/vector_index/chunks.tvim

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/upload | Upload and process a PDF document |
| GET | /api/documents | List all uploaded documents |
| DELETE | /api/documents/{id} | Remove a document and its graph data |
| POST | /api/chat | Send a question, get RAG response with citations |
| GET | /api/graph | Get knowledge graph data for visualization |
| GET | /api/concepts | List extracted concepts with relationships |

## Chunking Strategy

- Method: Recursive boundary detection
- Chunk size: 512 characters
- Overlap: 50 characters
- Split priority: paragraph break > sentence break > word break
- Metadata preserved: page number, document ID, chunk index, character offsets

## Retrieval Strategy (Hybrid)

1. Vector search: Find top-k (k=5) most similar chunks by cosine similarity
2. Graph expansion: For each retrieved chunk, find mentioned concepts and their neighbors
3. Graph chunks: Retrieve additional chunks that mention related concepts (up to 5)
4. Deduplication: Remove duplicate chunks, keep highest-scoring version
5. Context assembly: Format top results with document titles and page numbers

## Multilingual Approach

- BGE-M3 supports 100+ languages natively, enabling cross-lingual retrieval
- Entity extraction prompt instructs LLM to preserve original language of concepts
- Language detection on upload (Arabic characters, French indicators, default English)
- Chat response prompt matches the language of the user's question
- UI supports RTL layout for Arabic (planned)

## Security Considerations

- File upload validation: PDF only, max 20MB
- All API keys stored in environment variables, never in code
- CORS restricted to frontend origin in production
- No PII stored beyond uploaded document content
- Input validation via Pydantic models on all endpoints

## Performance Targets

- Document processing: under 60 seconds for a 50-page PDF
- Query response: under 5 seconds end-to-end
- Graph visualization: under 2 seconds for up to 200 nodes
- Embedding generation: under 3 seconds per chunk (HuggingFace API)
