from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import upload, chat, documents, graph, concepts

load_dotenv()

app = FastAPI(
    title="EduGraphRAG API",
    description="AI-powered multilingual educational GraphRAG backend",
    version="0.1.0",
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(graph.router, prefix="/api", tags=["graph"])
app.include_router(concepts.router, prefix="/api", tags=["concepts"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
