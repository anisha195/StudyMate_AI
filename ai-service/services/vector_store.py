"""
Thin wrapper around a persistent ChromaDB client. Each uploaded document
gets its own collection so retrieval stays scoped to that document.
"""
from typing import List

import chromadb

from .embeddings import embed_query, embed_texts

_client = chromadb.PersistentClient(path="./chroma_data")


def get_or_create_collection(collection_name: str):
    return _client.get_or_create_collection(name=collection_name)


def add_chunks(collection_name: str, chunks: List[dict]) -> None:
    """chunks: [{ text, page }]"""
    if not chunks:
        return

    collection = get_or_create_collection(collection_name)
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"page": c["page"]} for c in chunks]

    collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)


def query_collection(collection_name: str, query: str, top_k: int = 5) -> List[dict]:
    collection = get_or_create_collection(collection_name)
    query_embedding = embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    matches = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for doc, meta, dist in zip(documents, metadatas, distances):
        matches.append({
            "text": doc,
            "page": meta.get("page"),
            # Convert distance to an intuitive 0-1 similarity score
            "score": round(1 - dist, 4),
        })

    return matches


def delete_collection(collection_name: str) -> None:
    try:
        _client.delete_collection(name=collection_name)
    except Exception:
        pass  # Collection may not exist; deletion is best-effort
