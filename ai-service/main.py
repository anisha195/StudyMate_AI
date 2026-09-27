from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.pdf_processor import process_pdf
from services.vector_store import add_chunks, delete_collection, query_collection

app = FastAPI(title="StudyMate AI - Processing Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Locked down at the Node API gateway layer
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    collection_name: str
    query: str
    top_k: int = 5


@app.get("/health")
def health():
    return {"status": "ok", "service": "studymate-ai-processing"}


@app.post("/ingest")
async def ingest(file: UploadFile = File(...), collection_name: str = Form(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    try:
        chunks, page_count = process_pdf(file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not read PDF: {exc}")

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No extractable text was found (the PDF may be scanned images without OCR)",
        )

    add_chunks(collection_name, chunks)

    return {"page_count": page_count, "chunk_count": len(chunks)}


@app.post("/query")
def query(payload: QueryRequest):
    results = query_collection(payload.collection_name, payload.query, payload.top_k)
    return {"results": results}


@app.delete("/collections/{collection_name}")
def remove_collection(collection_name: str):
    delete_collection(collection_name)
    return {"message": "deleted"}
