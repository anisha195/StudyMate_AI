const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    // collectionName is the ChromaDB collection that stores this doc's chunks/embeddings
    collectionName: { type: String, required: true, unique: true },
    subject: { type: String, default: "General" },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    sizeBytes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
