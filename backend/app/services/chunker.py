"""Text chunking with recursive splitting on natural boundaries."""

import re
from dataclasses import dataclass

from app.config import settings


@dataclass
class TextChunk:
    text: str
    index: int
    page_number: int
    document_id: str
    start_char: int
    end_char: int


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def find_last_sentence_break(text: str, start: int, end: int) -> int:
    """Find the last sentence-ending punctuation followed by a space."""
    sentence_enders = ".!?。！？"
    for i in range(end, start, -1):
        if i < len(text) and text[i] in sentence_enders:
            if i + 1 < len(text) and text[i + 1] == " ":
                return i + 1
    return -1


def chunk_text(
    text: str,
    document_id: str,
    page_number: int,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[TextChunk]:
    """Split text into overlapping chunks using recursive boundary detection."""
    chunk_size = chunk_size or settings.chunk_size
    chunk_overlap = chunk_overlap or settings.chunk_overlap

    cleaned = clean_text(text)

    if len(cleaned) <= chunk_size:
        if not cleaned:
            return []
        return [
            TextChunk(
                text=cleaned,
                index=0,
                page_number=page_number,
                document_id=document_id,
                start_char=0,
                end_char=len(cleaned),
            )
        ]

    chunks: list[TextChunk] = []
    start = 0
    chunk_index = 0

    while start < len(cleaned):
        end = start + chunk_size

        if end < len(cleaned):
            # Try paragraph boundary
            para_break = cleaned.rfind("\n\n", start + int(chunk_size * 0.5), end)
            if para_break > start:
                end = para_break
            else:
                # Try sentence boundary
                sent_break = find_last_sentence_break(cleaned, start + int(chunk_size * 0.3), end)
                if sent_break > start:
                    end = sent_break
                else:
                    # Try word boundary
                    word_break = cleaned.rfind(" ", start, end)
                    if word_break > start:
                        end = word_break
        else:
            end = len(cleaned)

        chunk_text_str = cleaned[start:end].strip()
        if chunk_text_str:
            chunks.append(
                TextChunk(
                    text=chunk_text_str,
                    index=chunk_index,
                    page_number=page_number,
                    document_id=document_id,
                    start_char=start,
                    end_char=end,
                )
            )
            chunk_index += 1

        start = end - chunk_overlap
        if start >= len(cleaned):
            break

    return chunks


def chunk_document(
    pages: list[dict],
    document_id: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[TextChunk]:
    """Chunk a multi-page document."""
    all_chunks: list[TextChunk] = []
    global_index = 0

    for page in pages:
        page_chunks = chunk_text(
            page["text"],
            document_id,
            page["page_number"],
            chunk_size,
            chunk_overlap,
        )
        for chunk in page_chunks:
            chunk.index = global_index
            all_chunks.append(chunk)
            global_index += 1

    return all_chunks
