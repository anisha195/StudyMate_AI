"""
Wraps a Sentence Transformers model to embed text chunks and queries
into the same vector space used by ChromaDB for similarity search.
"""
from typing import List

from sentence_transformers import SentenceTransformer

# all-MiniLM-L6-v2: fast, small (~80MB), strong quality-for-speed tradeoff -
# a good default for a student-facing app that needs quick responses.
_MODEL_NAME = "all-MiniLM-L6-v2"
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_MODEL_NAME)
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return embeddings.tolist()


def embed_query(query: str) -> List[float]:
    return embed_texts([query])[0]
