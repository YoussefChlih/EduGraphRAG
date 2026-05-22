# Development Roadmap

## Phase 1: Foundation [COMPLETE]

- [x] Project structure and documentation
- [x] Next.js frontend with TypeScript and Tailwind
- [x] FastAPI backend with service layer
- [x] Environment variable configuration
- [x] Neo4j connection utility
- [x] Basic layout and navigation

## Phase 2: Document Ingestion [COMPLETE]

- [x] PDF upload UI with drag-and-drop
- [x] PDF parsing with PyMuPDF
- [x] Text cleaning and normalization
- [x] Recursive text chunking (512 chars, 50 overlap)
- [x] Embedding generation via HuggingFace API (BGE-M3)
- [x] Store chunks in Neo4j, embeddings in turbovec (local vector index)
- [ ] Document management UI (list, delete)

## Phase 3: Knowledge Graph [COMPLETE]

- [x] Entity extraction via LLM (concepts + descriptions)
- [x] Relation extraction (5 relationship types)
- [x] Neo4j graph construction
- [ ] Interactive graph visualization (react-force-graph)
- [x] Concept listing endpoint

## Phase 4: Retrieval and Chat [COMPLETE]

- [x] Vector similarity search via turbovec (local, TurboQuant)
- [x] Graph traversal retrieval (1-hop expansion)
- [x] Hybrid retrieval merging and deduplication
- [x] LangChain RAG pipeline (Groq + OpenAI)
- [x] Chat UI with message history
- [x] Source citations with document name and page number
- [ ] Streaming responses (SSE)
- [ ] Conversation history persistence

## Phase 5: Multilingual Support [IN PROGRESS]

- [x] Language detection on upload (AR, FR, EN)
- [x] Cross-lingual embeddings (BGE-M3)
- [x] Language-aware chat responses
- [ ] Arabic RTL layout support
- [ ] French language end-to-end testing
- [ ] Cross-lingual retrieval validation

## Phase 6: Polish and Testing

- [ ] Loading states and skeleton screens
- [ ] Error boundaries and user-friendly error messages
- [ ] Responsive design for mobile
- [ ] End-to-end testing with real documents
- [ ] Rate limiting on backend endpoints
- [ ] Input sanitization and validation hardening

## Phase 7: Deployment

- [ ] Neo4j Aura Cloud instance setup
- [ ] Vercel deployment for frontend
- [ ] Railway or Render deployment for backend
- [ ] Environment variable management in production
- [ ] Performance monitoring and logging
- [ ] User documentation
