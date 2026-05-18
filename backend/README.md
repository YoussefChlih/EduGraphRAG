# EduGraphRAG Backend

Python FastAPI backend for the EduGraphRAG platform.

## Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload and process a PDF |
| POST | `/api/chat` | Ask a question (RAG response) |
| GET | `/api/documents` | List uploaded documents |
| DELETE | `/api/documents/{id}` | Delete a document |
| GET | `/api/graph` | Get knowledge graph data |
| GET | `/api/concepts` | List extracted concepts |
| GET | `/api/health` | Health check |

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings from environment
│   ├── routers/             # API route handlers
│   │   ├── upload.py
│   │   ├── chat.py
│   │   ├── documents.py
│   │   ├── graph.py
│   │   └── concepts.py
│   └── services/            # Core business logic
│       ├── neo4j_service.py # Neo4j connection & queries
│       ├── pdf_parser.py    # PDF text extraction (PyMuPDF)
│       ├── chunker.py       # Text chunking
│       ├── embeddings.py    # BGE-M3 via HuggingFace API
│       ├── llm.py           # Groq/OpenAI via LangChain
│       ├── graph_builder.py # Entity extraction + Neo4j storage
│       └── retrieval.py     # Hybrid vector + graph retrieval
├── requirements.txt
└── .env.example
```
