const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8001").trim();

const client = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 120000, // PDF processing can take a while for large files
});

/**
 * Sends a PDF buffer to the Python microservice, which:
 * 1. Extracts text with PyPDF
 * 2. Chunks the text
 * 3. Generates embeddings with Sentence Transformers
 * 4. Stores vectors in a dedicated ChromaDB collection
 */
async function ingestDocument({ buffer, originalName, collectionName }) {
  const form = new FormData();
  form.append("file", buffer, { filename: originalName, contentType: "application/pdf" });
  form.append("collection_name", collectionName);

  const { data } = await client.post("/ingest", form, {
    headers: form.getHeaders(),
  });
  // Expected: { page_count, chunk_count }
  return data;
}

/**
 * Retrieves the top-k most relevant chunks for a query from a document's
 * ChromaDB collection (semantic search over Sentence Transformer embeddings).
 */
async function retrieveContext({ collectionName, query, topK = 5 }) {
  const { data } = await client.post("/query", {
    collection_name: collectionName,
    query,
    top_k: topK,
  });
  // Expected: { results: [{ text, page, score }] }
  return data.results || [];
}

/**
 * Deletes a document's collection from ChromaDB (cleanup when a doc is removed).
 */
async function deleteCollection(collectionName) {
  await client.delete(`/collections/${collectionName}`);
}

module.exports = { ingestDocument, retrieveContext, deleteCollection };
