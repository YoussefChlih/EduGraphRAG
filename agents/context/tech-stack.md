# Technology Stack Reference

## Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ | Full-stack React framework (App Router) |
| React | 18+ | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | latest | Accessible UI component library |
| Lucide React | latest | Icon library |
| react-force-graph | latest | Knowledge graph visualization |

## Backend & AI
| Technology | Version | Purpose |
|-----------|---------|---------|
| LangChain | 0.1+ | LLM orchestration and RAG pipeline |
| @langchain/groq | latest | Groq LLM integration |
| @langchain/openai | latest | OpenAI fallback |
| pdf-parse | latest | PDF text extraction |
| neo4j-driver | 5+ | Neo4j database driver |

## Database
| Technology | Purpose |
|-----------|---------|
| Neo4j AuraDB | Graph database + vector index |
| Neo4j Vector Index | Semantic similarity search |

## Embedding Models
| Model | Dimensions | Languages | Notes |
|-------|-----------|-----------|-------|
| BGE-M3 | 1024 | 100+ | Primary choice, excellent multilingual |
| multilingual-e5-large | 1024 | 100+ | Alternative option |

## LLM Models
| Provider | Model | Use Case |
|----------|-------|----------|
| Groq | llama-3.1-70b-versatile | Primary (fast inference) |
| Groq | llama-3.1-8b-instant | Entity extraction (cost-effective) |
| OpenAI | gpt-4o-mini | Fallback |

## Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend + API hosting |
| Neo4j Aura | Managed graph database |

## Key Integration Points
- **PDF → Chunks**: pdf-parse extracts text, recursive splitter creates chunks
- **Chunks → Embeddings**: BGE-M3 model generates 1024-dim vectors
- **Chunks → Graph**: LLM extracts entities/relations, stored in Neo4j
- **Query → Response**: Hybrid retrieval (vector + graph) feeds LLM context
