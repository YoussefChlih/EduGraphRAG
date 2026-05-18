# EduGraphRAG

AI-Powered Multilingual Educational GraphRAG Platform.

## Overview

EduGraphRAG is an intelligent educational assistant that transforms course documents into a knowledge graph and retrieval system. Students upload multilingual educational materials (PDFs, lecture notes, exercises), and the system automatically extracts concepts and relationships, enabling interaction through a conversational AI interface grounded in course content.

The platform combines Retrieval-Augmented Generation (RAG), Knowledge Graphs, semantic vector search, and Large Language Models to deliver contextual, explainable answers with source citations.

## Features

- Upload and process educational PDFs
- Automatic text extraction and chunking
- Multilingual support (English, French, Arabic)
- Knowledge graph generation with Neo4j
- Semantic vector search with BGE-M3 embeddings
- Hybrid GraphRAG retrieval pipeline (vector + graph traversal)
- AI chatbot with contextual, cited answers
- Concept relationship exploration and visualization

## Architecture

```
Frontend (Next.js, port 3000)        Backend (FastAPI, port 8000)
------------------------------       --------------------------------
  Upload Page                          POST /api/upload
  Chat Interface         <---->        POST /api/chat
  Graph Explorer                       GET  /api/graph
  Document List                        GET  /api/documents
                                       GET  /api/concepts
                                       DELETE /api/documents/{id}
                                              |
                                              v
                                       Neo4j AuraDB (Graph + Vector)
                                       Groq / OpenAI (LLM)
                                       HuggingFace (Embeddings)
```

## Tech Stack

### Frontend
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- shadcn/ui components
- Lucide React icons

### Backend
- Python 3.11+
- FastAPI
- LangChain (Groq + OpenAI)
- PyMuPDF for PDF parsing
- Neo4j Python driver
- httpx for async HTTP

### Database
- Neo4j AuraDB (graph storage + vector index)

### AI Models
- LLM: Groq (llama-3.1-70b-versatile) with OpenAI fallback
- Embeddings: BAAI/bge-m3 (1024 dimensions, 100+ languages)

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Neo4j Aura instance (free tier works)
- API keys: Groq or OpenAI, HuggingFace

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Fill in your API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
npm install
cp .env.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev
```

Open http://localhost:3000 in your browser.

### Neo4j Vector Index Setup

Run this Cypher query in your Neo4j Aura console:

```cypher
CREATE VECTOR INDEX chunk_embeddings FOR (c:Chunk) ON (c.embedding)
OPTIONS {indexConfig: {
  `vector.dimensions`: 1024,
  `vector.similarity_function`: 'cosine'
}}
```

## Project Structure

```
EduGraphRAG/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Environment settings
│   │   ├── routers/        # API endpoint handlers
│   │   └── services/       # Core business logic
│   ├── requirements.txt
│   └── .env.example
├── src/                     # Next.js frontend
│   ├── app/                 # Pages (home, upload, chat, graph)
│   ├── components/          # UI components
│   ├── config/              # Frontend configuration
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── agents/                  # AI agent prompts and context
├── design.md                # System architecture document
├── memory.md                # Project state tracker
├── roadmap.md               # Development phases
└── TODO.md                  # Immediate next steps
```

## System Workflow

```
Document Upload
    |
    v
PDF Parsing (PyMuPDF)
    |
    v
Text Chunking (recursive splitter, 512 tokens, 50 overlap)
    |
    v
Embedding Generation (BGE-M3, 1024 dimensions)
    |
    v
Entity and Relation Extraction (LLM-based)
    |
    v
Knowledge Graph Construction (Neo4j)
    |
    v
Hybrid Retrieval (Vector Search + Graph Traversal)
    |
    v
LLM Response Generation (with source citations)
```

## Use Cases

- Ask questions about course content and receive cited answers
- Generate contextual explanations of academic concepts
- Explore relationships between concepts visually
- Retrieve relevant sections from large educational documents
- Support multilingual educational environments (EN, FR, AR)

## License

MIT License. See [LICENSE](LICENSE) for details.
