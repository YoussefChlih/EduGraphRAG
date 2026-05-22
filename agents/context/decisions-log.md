# Architecture Decision Log

## ADR-001: Separated Frontend and Backend

Date: 2026-05-18
Status: Accepted (supersedes original full-stack Next.js approach)

Context: Initially used Next.js API routes for the backend. Encountered issues with PDF parsing libraries (pdfjs-dist workers, DataCloneError) in the Turbopack/Next.js server environment. Python has a more mature ecosystem for NLP, PDF processing, and LLM orchestration.

Decision: Use Next.js for frontend only (UI, routing, static pages). Use FastAPI (Python) for all backend logic.

Rationale:
- Python ecosystem is stronger for ML/NLP tasks (PyMuPDF, LangChain, etc.)
- No worker/bundler compatibility issues with PDF libraries
- FastAPI provides automatic OpenAPI docs and async support
- Clear separation of concerns simplifies deployment and testing
- Each component can be deployed and scaled independently

## ADR-002: Neo4j for Both Graph and Vector Storage

Date: 2026-05-17
Status: Superseded by ADR-008

Context: Need a graph database for the knowledge graph AND a vector database for semantic search.

Decision: Use Neo4j AuraDB with its built-in vector index feature.

Rationale:
- Single database for both graph traversal and vector similarity search
- Hybrid queries in a single Cypher call (no cross-database joins)
- Neo4j vector index supports cosine similarity natively
- Reduces infrastructure complexity
- Free tier available for development

## ADR-003: Groq as Primary LLM Provider

Date: 2026-05-17
Status: Accepted

Context: Need fast LLM inference for chat responses and entity extraction.

Decision: Use Groq API as primary provider, OpenAI as fallback.

Rationale:
- Groq inference is significantly faster (sub-second for most queries)
- Free tier is generous for development and testing
- llama-3.1-70b-versatile handles multilingual content well
- OpenAI fallback ensures reliability if Groq is unavailable
- LangChain abstracts the provider, making switching trivial

## ADR-004: BGE-M3 for Multilingual Embeddings

Date: 2026-05-17
Status: Accepted

Context: Need an embedding model that handles English, French, and Arabic effectively.

Decision: Use BAAI/bge-m3 via HuggingFace Inference API.

Rationale:
- Trained on 100+ languages with strong cross-lingual performance
- 1024 dimensions provides good precision
- HuggingFace Inference API avoids local GPU requirement
- Supports cross-lingual retrieval (query in French, retrieve Arabic content)
- No model download or hosting needed

## ADR-005: LangChain Python for RAG Orchestration

Date: 2026-05-18
Status: Accepted (updated from JS/TS to Python)

Context: Need to orchestrate the retrieval-augmented generation pipeline.

Decision: Use LangChain Python with langchain-groq and langchain-openai.

Rationale:
- Python LangChain is more mature than the JS version
- Better integration with the Python ML ecosystem
- Provides clean abstractions for chat models and message formatting
- Async support via ainvoke() for non-blocking operations
- Active community and frequent updates

## ADR-006: PyMuPDF for PDF Parsing

Date: 2026-05-18
Status: Accepted (replaced pdf-parse and unpdf)

Context: Previous attempts with pdf-parse (pdfjs-dist worker issues) and unpdf (DataCloneError) failed in the Next.js server environment. Needed a reliable, server-friendly PDF parser.

Decision: Use PyMuPDF (fitz) in the Python backend.

Rationale:
- Pure C extension, no JavaScript workers or browser APIs needed
- Fast and memory-efficient
- Provides per-page text extraction out of the box
- Handles complex PDF layouts well
- Well-maintained with extensive documentation

## ADR-007: Chunk Size of 512 Characters with 50 Character Overlap

Date: 2026-05-17
Status: Accepted

Context: Need to determine optimal chunk size for educational content retrieval.

Decision: 512 characters per chunk, 50 character overlap.

Rationale:
- Educational content often has self-contained paragraphs around this size
- Overlap ensures context is not lost at chunk boundaries
- Small enough for precise retrieval, large enough for meaningful content
- Recursive splitting on paragraph, sentence, then word boundaries preserves coherence


## ADR-008: turbovec for Vector Similarity Search (replaces Neo4j Vector Index)

Date: 2026-05-22
Status: Accepted (supersedes ADR-002 for vector search)

Context: Neo4j's built-in vector index works but adds latency (network round-trip to AuraDB for every search), ties vector search to a managed service, and stores full float32 embeddings (6 KB per 1024-dim vector). Wanted a faster, local, privacy-friendly alternative.

Decision: Use turbovec (TurboQuant-based Rust vector index with Python bindings) for all vector similarity search. Neo4j remains for the knowledge graph only.

Rationale:
- Pure local: no data leaves the machine, no managed service dependency for search
- 4-bit quantization: 16x compression (1024-dim vector goes from 4 KB float32 to 256 bytes)
- Faster than FAISS: SIMD-accelerated scoring (NEON on ARM, AVX-512 on x86)
- Zero training: data-oblivious quantizer, no codebook calibration or rebuilds
- Persistent: IdMapIndex saves to disk (.tvim format), survives restarts
- Filtered search: supports allowlist-based retrieval for future hybrid use cases
- Simple API: pip install turbovec, add vectors, search — no server to manage
- Neo4j still handles graph traversal, document/chunk metadata, and concept relationships
