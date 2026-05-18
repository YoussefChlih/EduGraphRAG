# Project Memory

## Project Name
**Kwiz_y** — AI-Powered Multilingual Educational GraphRAG Platform

## Summary
An AI-powered educational assistant that transforms course documents into an intelligent knowledge graph and retrieval system. Students upload multilingual educational materials (PDFs, lecture notes, exercises, summaries), the system extracts concepts and relationships, and provides a conversational AI interface grounded in course materials.

## Current Status
- [x] Project initialized
- [x] Documentation and agent memory created
- [x] Frontend scaffolding (Next.js + Tailwind + shadcn/ui)
- [x] Backend API routes (upload, chat, documents, graph, concepts)
- [x] Neo4j connection setup (src/lib/neo4j.ts)
- [x] PDF upload and parsing pipeline (pdf-parse v2)
- [x] Text chunking logic (src/lib/chunker.ts)
- [x] Embedding generation (src/lib/embeddings.ts — BGE-M3 via HuggingFace)
- [x] Entity & relation extraction (src/lib/graph-builder.ts — LLM-based)
- [x] Knowledge graph construction (Neo4j)
- [ ] Vector index setup in Neo4j (needs CREATE VECTOR INDEX on Aura)
- [x] Hybrid retrieval pipeline (src/lib/retrieval.ts — Graph + Vector)
- [x] LLM response generation (src/lib/llm.ts — Groq/OpenAI via LangChain)
- [x] Chat UI with source citations
- [x] Multilingual support (EN, FR, AR) — language detection on upload
- [ ] Deployment (Vercel + Neo4j Aura)
- [x] Build passes successfully

## Key Decisions
- Frontend: Next.js (UI only, no API routes) — calls Python backend
- Backend: FastAPI (Python) — all business logic, LLM, Neo4j, PDF parsing
- Neo4j AuraDB for both graph storage and vector index
- LangChain (Python) as the orchestration layer for RAG pipeline
- Groq API as primary LLM (fast inference), OpenAI as fallback
- BGE-M3 for multilingual embeddings via HuggingFace Inference API
- PyMuPDF (fitz) for PDF text extraction — fast, no worker issues
- shadcn/ui for consistent, accessible UI components

## Architecture Notes
- Separated frontend/backend: Next.js (port 3000) + FastAPI (port 8000)
- Frontend calls `NEXT_PUBLIC_API_URL` for all API requests
- Backend in `/backend` with its own venv and requirements.txt
- `/backend/app/services` contains core logic (chunking, embedding, graph, retrieval, llm)
- `/agents` contains agent-specific prompts and configurations
- Neo4j stores: nodes (concepts, documents, chunks), relationships, and vector embeddings

## Last Updated
2026-05-17 — Full implementation: frontend pages, API routes, core libraries, build passing
