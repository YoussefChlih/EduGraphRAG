# Architecture Decision Log

## ADR-001: Next.js as Full-Stack Framework
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need a framework that handles both frontend UI and backend API routes.  
**Decision**: Use Next.js App Router for both frontend and API routes.  
**Rationale**: Single deployment target (Vercel), shared types, simpler project structure, excellent DX.

## ADR-002: Neo4j for Both Graph and Vector Storage
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need graph database for knowledge graph AND vector database for semantic search.  
**Decision**: Use Neo4j AuraDB with its built-in vector index feature.  
**Rationale**: Avoids managing two separate databases. Neo4j's vector index supports cosine similarity search natively. Simplifies the hybrid retrieval query (single database call for both graph traversal and vector search).

## ADR-003: Groq as Primary LLM Provider
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need fast LLM inference for chat responses and entity extraction.  
**Decision**: Use Groq API as primary, OpenAI as fallback.  
**Rationale**: Groq offers significantly faster inference (< 1s for most queries). Free tier is generous for development. OpenAI fallback ensures reliability.

## ADR-004: BGE-M3 for Multilingual Embeddings
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need embedding model that handles English, French, and Arabic well.  
**Decision**: Use BGE-M3 (BAAI/bge-m3) for all embedding generation.  
**Rationale**: Trained on 100+ languages, 1024 dimensions, strong performance on multilingual benchmarks. Supports the cross-lingual retrieval requirement (query in French, retrieve Arabic content).

## ADR-005: LangChain for RAG Orchestration
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need to orchestrate the retrieval-augmented generation pipeline.  
**Decision**: Use LangChain JS/TS for the RAG pipeline.  
**Rationale**: Provides abstractions for document loading, text splitting, vector stores, retrievers, and chains. Has Neo4j and Groq integrations. Reduces boilerplate significantly.

## ADR-006: Chunk Size of 512 Tokens with 50 Token Overlap
**Date**: 2026-05-17  
**Status**: Accepted  
**Context**: Need to determine optimal chunk size for educational content.  
**Decision**: 512 tokens per chunk, 50 token overlap.  
**Rationale**: Educational content often has self-contained paragraphs around this size. Overlap ensures context isn't lost at boundaries. Small enough for precise retrieval, large enough for meaningful content.
