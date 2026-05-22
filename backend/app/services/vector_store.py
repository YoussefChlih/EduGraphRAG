"""Vector store service using turbovec (TurboQuant-based vector index)."""

import os
import numpy as np
from turbovec import IdMapIndex
from app.config import settings

_index: IdMapIndex | None = None

# BGE-M3 produces 1024-dim embeddings
EMBEDDING_DIM = 1024
BIT_WIDTH = 4  # 4-bit quantization (good recall/compression tradeoff)


def _index_path() -> str:
    """Return the path to the persisted index file."""
    return os.path.join(settings.vector_store_path, "chunks.tvim")


def get_index() -> IdMapIndex:
    """Get or create the turbovec index, loading from disk if available."""
    global _index
    if _index is not None:
        return _index

    path = _index_path()
    if os.path.exists(path):
        _index = IdMapIndex.load(path)
    else:
        os.makedirs(settings.vector_store_path, exist_ok=True)
        _index = IdMapIndex(dim=EMBEDDING_DIM, bit_width=BIT_WIDTH)

    return _index


def save_index() -> None:
    """Persist the index to disk."""
    if _index is not None:
        os.makedirs(settings.vector_store_path, exist_ok=True)
        _index.write(_index_path())


# Mapping between chunk string IDs and uint64 IDs for turbovec
_id_to_chunk: dict[int, str] = {}
_chunk_to_id: dict[str, int] = {}
_next_id: int = 1


def _id_map_path() -> str:
    return os.path.join(settings.vector_store_path, "id_map.npy")


def _load_id_map() -> None:
    """Load the ID mapping from disk."""
    global _id_to_chunk, _chunk_to_id, _next_id
    path = _id_map_path()
    if os.path.exists(path):
        data = np.load(path, allow_pickle=True).item()
        _id_to_chunk = data.get("id_to_chunk", {})
        _chunk_to_id = data.get("chunk_to_id", {})
        _next_id = data.get("next_id", 1)


def _save_id_map() -> None:
    """Persist the ID mapping to disk."""
    os.makedirs(settings.vector_store_path, exist_ok=True)
    np.save(
        _id_map_path(),
        {
            "id_to_chunk": _id_to_chunk,
            "chunk_to_id": _chunk_to_id,
            "next_id": _next_id,
        },
    )


# Load ID map on module import
_load_id_map()


def add_vector(chunk_id: str, embedding: list[float]) -> None:
    """Add a single vector to the index."""
    global _next_id

    index = get_index()
    vec = np.array([embedding], dtype=np.float32)
    numeric_id = np.array([_next_id], dtype=np.uint64)

    index.add_with_ids(vec, numeric_id)

    _id_to_chunk[_next_id] = chunk_id
    _chunk_to_id[chunk_id] = _next_id
    _next_id += 1

    save_index()
    _save_id_map()


def add_vectors(chunk_ids: list[str], embeddings: list[list[float]]) -> None:
    """Add multiple vectors to the index in batch."""
    global _next_id

    if not chunk_ids:
        return

    index = get_index()
    vecs = np.array(embeddings, dtype=np.float32)
    numeric_ids = np.array(
        list(range(_next_id, _next_id + len(chunk_ids))), dtype=np.uint64
    )

    index.add_with_ids(vecs, numeric_ids)

    for i, chunk_id in enumerate(chunk_ids):
        nid = _next_id + i
        _id_to_chunk[nid] = chunk_id
        _chunk_to_id[chunk_id] = nid

    _next_id += len(chunk_ids)

    save_index()
    _save_id_map()


def remove_vector(chunk_id: str) -> None:
    """Remove a vector from the index by chunk ID."""
    if chunk_id not in _chunk_to_id:
        return

    numeric_id = _chunk_to_id[chunk_id]
    index = get_index()
    index.remove(numeric_id)

    del _id_to_chunk[numeric_id]
    del _chunk_to_id[chunk_id]

    save_index()
    _save_id_map()


def search(query_embedding: list[float], top_k: int = 5) -> list[tuple[str, float]]:
    """Search for similar vectors. Returns list of (chunk_id, score) tuples."""
    index = get_index()

    # Check if index has any vectors
    if not _id_to_chunk:
        return []

    query = np.array([query_embedding], dtype=np.float32)
    scores, ids = index.search(query, k=top_k)

    results = []
    for score, numeric_id in zip(scores[0], ids[0]):
        # turbovec may return -1 for unfilled slots
        if numeric_id == -1 or numeric_id == np.iinfo(np.uint64).max:
            continue
        chunk_id = _id_to_chunk.get(int(numeric_id))
        if chunk_id:
            results.append((chunk_id, float(score)))

    return results


def remove_document_vectors(document_id: str) -> None:
    """Remove all vectors belonging to a document."""
    # Find all chunk IDs that belong to this document
    to_remove = [
        cid for cid in _chunk_to_id if cid.startswith(f"{document_id}_chunk_")
    ]
    for chunk_id in to_remove:
        remove_vector(chunk_id)
