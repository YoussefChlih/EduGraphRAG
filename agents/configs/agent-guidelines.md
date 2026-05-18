# Agent Guidelines

## Project Architecture

This project uses a separated frontend/backend architecture:

- Frontend: Next.js (TypeScript) on port 3000 -- UI only, no API routes
- Backend: FastAPI (Python) on port 8000 -- all business logic

## Frontend Conventions (TypeScript / Next.js)

### General Rules
- TypeScript strict mode
- Functional components with hooks
- Named exports preferred
- Descriptive variable names
- Comments only for complex logic

### File Naming
- Components: PascalCase (ChatInterface.tsx)
- Utilities: camelCase (utils.ts)
- Types: PascalCase in types/ folder

### Frontend Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home/landing
│   ├── chat/page.tsx       # Chat interface
│   ├── upload/page.tsx     # Document upload
│   └── graph/page.tsx      # Graph explorer
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui base components
│   └── navigation.tsx      # App navigation
├── lib/                    # Frontend utilities
│   └── utils.ts            # cn() helper for Tailwind
├── types/                  # TypeScript type definitions
│   └── index.ts
└── config/                 # Frontend configuration
    └── index.ts            # API URL, app name
```

### Frontend Dependencies
- next, react, react-dom
- tailwindcss, @tailwindcss/postcss
- class-variance-authority, clsx, tailwind-merge
- lucide-react

### API Communication
All API calls go to NEXT_PUBLIC_API_URL (default: http://localhost:8000).
Use fetch() with the full URL prefix.

## Backend Conventions (Python / FastAPI)

### General Rules
- Python 3.11+ with type hints
- Async functions for all I/O operations
- Pydantic models for request/response validation
- Descriptive function and variable names
- Docstrings for public functions

### File Naming
- Modules: snake_case (pdf_parser.py)
- Classes: PascalCase (TextChunk)
- Functions: snake_case (extract_entities)

### Backend Structure
```
backend/
├── app/
│   ├── main.py             # FastAPI app, CORS, router registration
│   ├── config.py           # Settings from environment variables
│   ├── routers/            # API endpoint handlers
│   │   ├── upload.py       # POST /api/upload
│   │   ├── chat.py         # POST /api/chat
│   │   ├── documents.py    # GET/DELETE /api/documents
│   │   ├── graph.py        # GET /api/graph
│   │   └── concepts.py     # GET /api/concepts
│   └── services/           # Core business logic
│       ├── neo4j_service.py
│       ├── pdf_parser.py
│       ├── chunker.py
│       ├── embeddings.py
│       ├── llm.py
│       ├── graph_builder.py
│       └── retrieval.py
├── requirements.txt
└── .env.example
```

### Backend Dependencies
- fastapi, uvicorn, python-multipart
- neo4j (Python driver)
- langchain, langchain-groq, langchain-openai
- pymupdf (fitz) for PDF parsing
- httpx for async HTTP requests
- python-dotenv for environment loading

### Error Handling
- Use HTTPException with appropriate status codes
- Log errors server-side with context
- Return consistent JSON format to frontend

### API Response Format
```json
// Success
{"success": true, "data": {...}}

// Error (via HTTPException)
{"detail": "Error description"}
```

## Environment Variables

### Backend (.env)
```
NEO4J_URI=neo4j+s://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
HF_API_TOKEN=hf_...
EMBEDDING_MODEL=BAAI/bge-m3
CHUNK_SIZE=512
CHUNK_OVERLAP=50
MAX_FILE_SIZE_MB=20
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Kwiz_y
```
