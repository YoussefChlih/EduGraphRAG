"""Embedding generation using HuggingFace Inference API (BGE-M3)."""

import httpx
from app.config import settings


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    if not settings.hf_api_token:
        raise ValueError("Missing HF_API_TOKEN environment variable")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            settings.embedding_api_url,
            headers={"Authorization": f"Bearer {settings.hf_api_token}"},
            json={"inputs": text, "options": {"wait_for_model": True}},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Embedding API error ({response.status_code}): {response.text}"
        )

    result = response.json()

    # HuggingFace returns either a flat array or nested array
    if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
        return result[0]
    return result


async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts."""
    if not settings.hf_api_token:
        raise ValueError("Missing HF_API_TOKEN environment variable")

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            settings.embedding_api_url,
            headers={"Authorization": f"Bearer {settings.hf_api_token}"},
            json={"inputs": texts, "options": {"wait_for_model": True}},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Embedding API error ({response.status_code}): {response.text}"
        )

    return response.json()
