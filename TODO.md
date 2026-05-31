# TODO -- Immediate Next Steps

## Priority Tasks

1. Create backend/.env with real API keys (copy from backend/.env.example):
   - Neo4j Aura credentials (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
   - Groq API key (GROQ_API_KEY)
   - HuggingFace token with "Inference Providers" permission (HF_API_TOKEN)

2. Install backend dependencies and run (Python 3.13):
   ```bash
   cd backend
   py -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. Test the full pipeline end-to-end with a small PDF

4. Add interactive graph visualization with react-force-graph

5. Add document list page showing uploaded documents with delete option

## Open Questions

- Neo4j Aura free tier: confirm limits for graph storage
- HuggingFace Inference Providers: measure latency for BGE-M3 embeddings via the router endpoint
- Groq rate limits: determine if batching is needed for large documents
- Deployment: choose between Railway and Render for the Python backend
- turbovec persistence: ensure vector index (backend/data/) is backed up in production

## Future Enhancements

- Streaming chat responses via Server-Sent Events
- Background task queue for document processing (Celery or similar)
- RTL layout support for Arabic content
- Export knowledge graphs as images or JSON
- Multi-user support with authentication
- Document versioning and re-processing
- Batch upload for multiple PDFs
