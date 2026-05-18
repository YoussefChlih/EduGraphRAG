import os
from pydantic import BaseModel


class Settings(BaseModel):
    # Neo4j
    neo4j_uri: str = os.getenv("NEO4J_URI", "")
    neo4j_username: str = os.getenv("NEO4J_USERNAME", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "")

    # LLM
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # Embeddings
    hf_api_token: str = os.getenv("HF_API_TOKEN", "")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    embedding_api_url: str = os.getenv(
        "EMBEDDING_API_URL",
        "https://api-inference.huggingface.co/models/BAAI/bge-m3",
    )

    # App
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "512"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "50"))


settings = Settings()
