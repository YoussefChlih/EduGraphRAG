# Technology Stack Reference

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | React framework (App Router, UI only) |
| React | 19 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | latest | Accessible UI component library |
| Lucide React | latest | Icon library |
| class-variance-authority | latest | Component variant management |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Backend language |
| FastAPI | 0.115 | Async web framework |
| Uvicorn | 0.30 | ASGI server |
| LangChain | 0.3 | LLM orchestration and RAG pipeline |
| langchain-groq | 0.2 | Groq LLM integration |
| langchain-openai | 0.2 | OpenAI fallback integration |
| PyMuPDF (fitz) | 1.24 | PDF text extraction |
| neo4j | 5.25 | Neo4j Python driver |
| httpx | 0.27 | Async HTTP client (for embeddings API) |
| python-dotenv | 1.0 | Environment variable loading |
| Pydantic | 2.9 | Data validation and settings |
| turbovec | 0.5.2 | Local vector index (TurboQuant, Rust + Python) |
| numpy | 1.26 | Numerical arrays for vector operations |

## Database & Vector Search

| Technology | Purpose |
|-----------|---------|
| Neo4j AuraDB | Knowledge graph (documents, chunks, concepts, relationships) |
| turbovec | Local vector similarity search (4-bit TurboQuant quantization) |

## Embedding Models

| Model | Dimensions | Languages | Notes |
|-------|-----------|-----------|-------|
| BAAI/bge-m3 | 1024 | 100+ | Primary choice, strong multilingual performance |
| multilingual-e5-large | 1024 | 100+ | Alternative option |

Embeddings are generated via the HuggingFace Inference API (no local GPU required).

## LLM Models

| Provider | Model | Use Case |
|----------|-------|----------|
| Groq | llama-3.1-70b-versatile | Chat responses (primary, fast inference) |
| Groq | llama-3.1-8b-instant | Entity extraction (cost-effective) |
| OpenAI | gpt-4o-mini | Fallback for both tasks |

## Deployment Targets

| Service | Component |
|---------|-----------|
| Vercel | Next.js frontend |
| Railway / Render | FastAPI backend |
| Neo4j Aura | Managed graph database |

## Key Integration Points

- PDF to Chunks: PyMuPDF extracts per-page text, recursive splitter creates overlapping chunks
- Chunks to Embeddings: BGE-M3 via HuggingFace API generates 1024-dim vectors
- Embeddings to Vector Index: turbovec stores quantized vectors locally with persistent ID mapping
- Chunks to Graph: LLM extracts entities and relations, stored as Neo4j nodes and edges
- Query to Response: Hybrid retrieval (turbovec vector search + Neo4j graph traversal) builds context, LLM generates cited answer
