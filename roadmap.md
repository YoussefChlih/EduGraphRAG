# Development Roadmap

## Phase 1: Foundation (Current)
- [x] Project structure and documentation
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up environment variables structure
- [ ] Neo4j AuraDB connection utility
- [ ] Basic layout and navigation

## Phase 2: Document Ingestion
- [ ] PDF upload UI component
- [ ] PDF parsing with pdf-parse
- [ ] Text cleaning and normalization
- [ ] Recursive text chunking
- [ ] Embedding generation (BGE-M3 via API or local)
- [ ] Store chunks + embeddings in Neo4j vector index
- [ ] Document management UI (list, delete)

## Phase 3: Knowledge Graph
- [ ] Entity extraction prompts (LLM-based)
- [ ] Relation extraction prompts
- [ ] Neo4j graph construction (concepts + relationships)
- [ ] Graph visualization component (force-directed)
- [ ] Concept exploration UI

## Phase 4: Retrieval & Chat
- [ ] Vector similarity search implementation
- [ ] Graph traversal retrieval
- [ ] Hybrid retrieval merging + re-ranking
- [ ] LangChain RAG chain setup
- [ ] Chat UI with streaming responses
- [ ] Source citations with page references
- [ ] Conversation history management

## Phase 5: Multilingual & Polish
- [ ] Language detection on upload
- [ ] Arabic RTL support
- [ ] French language testing
- [ ] Cross-lingual retrieval validation
- [ ] UI/UX polish and responsive design
- [ ] Error handling and loading states

## Phase 6: Deployment
- [ ] Vercel deployment configuration
- [ ] Neo4j Aura Cloud setup
- [ ] Environment variable management
- [ ] Performance optimization
- [ ] Documentation for end users
