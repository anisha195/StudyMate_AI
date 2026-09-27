"""
Extracts text from PDFs (PyPDF) and splits it into overlapping chunks
sized for good retrieval quality with Sentence Transformer embeddings.
"""
import io
import re
from typing import List, TypedDict

from pypdf import PdfReader


class Chunk(TypedDict):
    text: str
    page: int


def extract_pages(file_bytes: bytes) -> List[str]:
    """Returns a list of raw text strings, one per PDF page."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        # Collapse excessive whitespace left behind by PDF extraction
        text = re.sub(r"\s+", " ", text).strip()
        pages.append(text)
    return pages


def chunk_text(
    pages: List[str],
    chunk_size: int = 900,
    chunk_overlap: int = 150,
) -> List[Chunk]:
    """
    Splits page text into overlapping chunks (character-based) while
    tracking which page each chunk came from, so answers can cite pages.
    """
    chunks: List[Chunk] = []

    for page_num, page_text in enumerate(pages, start=1):
        if not page_text:
            continue

        start = 0
        while start < len(page_text):
            end = start + chunk_size
            piece = page_text[start:end].strip()
            if piece:
                chunks.append({"text": piece, "page": page_num})
            if end >= len(page_text):
                break
            start = end - chunk_overlap  # overlap preserves context across boundaries

    return chunks


def process_pdf(file_bytes: bytes) -> tuple[List[Chunk], int]:
    """Full pipeline: extract pages -> chunk -> return (chunks, page_count)."""
    pages = extract_pages(file_bytes)
    chunks = chunk_text(pages)
    return chunks, len(pages)
