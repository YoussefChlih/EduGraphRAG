# Project Memory

## Project Name

EduGraphRAG -- AI-Powered Multilingual Educational GraphRAG Platform

## Summary

An AI-powered educational assistant that transforms course documents into an intelligent knowledge graph and retrieval system. Students upload multilingual educational materials (PDFs, lecture notes, exercises, summaries), the system extracts concepts and relationships, and provides a conversational AI interface grounded in course materials.

## Current Status

- [x] Project initialized and documented
- [x] Frontend scaffolding (Next.js 16 + Tailwind v4 + shadcn/ui)
- [x] Backend scaffolding (FastAPI + all services)
- [x] PDF parsing (PyMuPDF)
- [x] Text chunking (recursive boundary detection)
- [x] Embedding generation (BGE-M3 via HuggingFace API)
- [x] Entity and relation extraction (LLM-based)
- [x] Knowledge graph storage (Neo4j)
- [x] Hybrid retrieval pipeline (vector + graph)
- [x] Vector search migrated to turbovec (local, TurboQuant)
- [x] LLM response generation (Groq/OpenAI via LangChain)
- [x] Chat UI with source citations
- [x] Upload UI with drag-and-drop
- [x] Graph explorer page
- [x] Multilingual support (EN, FR, AR) with language detection
- [x] Frontend build passes
- [ ] End-to-end testing with real API keys
- [ ] Graph visualization (react-force-graph)
- [ ] Deployment (Vercel + Railway/Render + Neo4j Aura)

## Architecture

- Frontend: Next.js (port 3000) -- UI only, calls backend API
- Backend: FastAPI (port 8000) -- all business logic
- Database: Neo4j AuraDB -- knowledge graph storage
- Vector Search: turbovec (local, TurboQuant 4-bit quantization)
- LLM: Groq (primary) / OpenAI (fallback) via LangChain
- Embeddings: BAAI/bge-m3 via HuggingFace Inference API
- PDF: PyMuPDF (fitz)

## Key Decisions

- Separated frontend/backend after encountering JS PDF library issues in Next.js
- Python backend chosen for mature ML/NLP ecosystem
- Neo4j for knowledge graph (documents, chunks, concepts, relationships)
- turbovec for vector similarity search (local, fast, 16x compression vs float32)
- BGE-M3 for cross-lingual retrieval without local GPU
- Groq for fast inference, OpenAI as reliable fallback
- PyMuPDF for robust PDF parsing without worker dependencies

## File Layout

```
EduGraphRAG/
├── backend/                 # Python FastAPI
│   ├── app/main.py
│   ├── app/config.py
│   ├── app/routers/        # upload, chat, documents, graph, concepts
│   └── app/services/       # neo4j, pdf_parser, chunker, embeddings, llm, graph_builder, retrieval
├── src/                     # Next.js frontend
│   ├── app/                 # Pages: home, upload, chat, graph
│   ├── components/          # Navigation, UI components
│   ├── config/              # API URL config
│   ├── lib/                 # cn() utility
│   └── types/               # TypeScript types
└── agents/                  # Prompts, configs, context for AI agents
```

## Last Updated

2026-05-18 -- Backend migrated to Python FastAPI, all docs updated
