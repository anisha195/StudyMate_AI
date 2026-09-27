const crypto = require("crypto");
const Document = require("../models/Document");
const aiServiceClient = require("../services/aiServiceClient");

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file was uploaded" });
    }

    const collectionName = `doc_${req.user._id}_${crypto.randomBytes(6).toString("hex")}`;

    // Create the record immediately in "processing" state so the UI can show progress
    const doc = await Document.create({
      user: req.user._id,
      originalName: req.file.originalname,
      collectionName,
      subject: req.body.subject || "General",
      sizeBytes: req.file.size,
      status: "processing",
    });

    try {
      const result = await aiServiceClient.ingestDocument({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        collectionName,
      });

      doc.pageCount = result.page_count || 0;
      doc.chunkCount = result.chunk_count || 0;
      doc.status = "ready";
      await doc.save();
    } catch (ingestErr) {
      doc.status = "failed";
      await doc.save();
      console.error("[Ingest error]", ingestErr.message);
      return res.status(502).json({ message: "Failed to process the PDF for search. Please try again." });
    }

    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
}

async function listDocuments(req, res, next) {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    await aiServiceClient.deleteCollection(doc.collectionName).catch(() => {
      // Non-fatal: proceed with metadata deletion even if vector cleanup fails
      console.warn(`[Warn] Could not delete Chroma collection ${doc.collectionName}`);
    });

    await doc.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadDocument, listDocuments, deleteDocument };
