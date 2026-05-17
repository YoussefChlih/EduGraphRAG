# TODO — Immediate Next Steps

## Completed
- [x] Next.js project initialized with TypeScript
- [x] Tailwind CSS configured (v4 via @tailwindcss/postcss)
- [x] shadcn/ui components (Button, Card, Input)
- [x] Project folder structure (lib, components, types, config)
- [x] .env.example with required variables
- [x] Neo4j connection utility (src/lib/neo4j.ts)
- [x] App layout with navigation (Upload, Chat, Graph pages)
- [x] All API routes (upload, chat, documents, graph, concepts)
- [x] Core libraries (chunker, embeddings, graph-builder, retrieval, llm)
- [x] Build passes successfully

## Next Session Priority
1. Set up Neo4j Aura instance and create vector index:
   ```cypher
   CREATE VECTOR INDEX chunk_embeddings FOR (c:Chunk) ON (c.embedding)
   OPTIONS {indexConfig: {`vector.dimensions`: 1024, `vector.similarity_function`: 'cosine'}}
   ```
2. Add `.env.local` with real API keys (Groq, HuggingFace, Neo4j)
3. Test the full upload → chat flow end-to-end with a small PDF
4. Add react-force-graph for interactive graph visualization
5. Add loading states and error boundaries to pages
6. Add document list page showing uploaded documents

## Blockers / Questions
- [ ] Confirm Neo4j Aura free tier supports vector indexes
- [ ] Test BGE-M3 via HuggingFace Inference API response time
- [ ] Groq API rate limits for entity extraction on large documents (may need batching)

## Future Enhancements
- Streaming chat responses (SSE or ReadableStream)
- Document processing queue (for large PDFs, process async)
- RTL layout support for Arabic content
- Export/share knowledge graphs
- Multi-user support with authentication
