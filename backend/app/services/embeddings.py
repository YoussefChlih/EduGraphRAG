"""Embedding generation using HuggingFace Inference API (BGE-M3).

Uses the Inference Providers router endpoint:
https://router.huggingface.co/hf-inference/models/<model>/pipeline/feature-extraction
"""

import httpx
from app.config import settings


def _to_sentence_vector(result) -> list[float]:
    """Normalize a feature-extraction response into a single 1D embedding.

    The pipeline can return:
      - a 1D array (pooled sentence embedding) -> use as-is
      - a 2D array (per-token embeddings)      -> mean-pool over tokens
    """
    if not isinstance(result, list) or len(result) == 0:
        raise RuntimeError(f"Unexpected embedding response: {repr(result)[:200]}")

    # 1D: list of floats
    if isinstance(result[0], (int, float)):
        return [float(x) for x in result]

    # 2D: list of token vectors -> mean pool
    if isinstance(result[0], list):
        num_tokens = len(result)
        dim = len(result[0])
        pooled = [0.0] * dim
        for token_vec in result:
            for i, v in enumerate(token_vec):
                pooled[i] += float(v)
        return [v / num_tokens for v in pooled]

    raise RuntimeError(f"Unexpected embedding response shape: {repr(result)[:200]}")


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    if not settings.hf_api_token:
        raise ValueError("Missing HF_API_TOKEN environment variable")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            settings.embedding_api_url,
            headers={"Authorization": f"Bearer {settings.hf_api_token}"},
            json={"inputs": text},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Embedding API error ({response.status_code}): {response.text}"
        )

    return _to_sentence_vector(response.json())


async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts."""
    if not settings.hf_api_token:
        raise ValueError("Missing HF_API_TOKEN environment variable")

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            settings.embedding_api_url,
            headers={"Authorization": f"Bearer {settings.hf_api_token}"},
            json={"inputs": texts},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Embedding API error ({response.status_code}): {response.text}"
        )

    result = response.json()

    # Batch response is a list, one entry per input text. Each entry may be
    # a 1D pooled vector or a 2D token matrix.
    return [_to_sentence_vector(item) for item in result]
