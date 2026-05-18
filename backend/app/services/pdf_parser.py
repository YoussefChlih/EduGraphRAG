"""PDF text extraction using PyMuPDF (fitz)."""

import fitz  # pymupdf


def parse_pdf(file_bytes: bytes) -> dict:
    """
    Extract text from PDF bytes, returning per-page text.

    Returns:
        {
            "pages": [{"text": "...", "page_number": 1}, ...],
            "total_pages": int,
            "full_text": str
        }
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []

    for i, page in enumerate(doc):
        text = page.get_text("text")
        pages.append({"text": text, "page_number": i + 1})

    doc.close()

    full_text = "\n".join(p["text"] for p in pages)

    return {
        "pages": pages,
        "total_pages": len(pages),
        "full_text": full_text,
    }
