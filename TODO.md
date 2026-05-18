# TODO -- Immediate Next Steps

## Priority Tasks

1. Set up Neo4j Aura instance and create the vector index:
   ```cypher
   CREATE VECTOR INDEX chunk_embeddings FOR (c:Chunk) ON (c.embedding)
   OPTIONS {indexConfig: {
     `vector.dimensions`: 1024,
     `vector.similarity_function`: 'cosine'
   }}
   ```

2. Create backend/.env with real API keys:
   - Neo4j Aura credentials
   - Groq API key
   - HuggingFace API token

3. Install backend dependencies and test:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. Test the full pipeline end-to-end with a small PDF

5. Add interactive graph visualization with react-force-graph

6. Add document list page showing uploaded documents with delete option

## Open Questions

- Neo4j Aura free tier: confirm vector index support and limits
- HuggingFace Inference API: measure latency for BGE-M3 embeddings
- Groq rate limits: determine if batching is needed for large documents
- Deployment: choose between Railway and Render for the Python backend

## Future Enhancements

- Streaming chat responses via Server-Sent Events
- Background task queue for document processing (Celery or similar)
- RTL layout support for Arabic content
- Export knowledge graphs as images or JSON
- Multi-user support with authentication
- Document versioning and re-processing
- Batch upload for multiple PDFs
