const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    // Which source chunks were used to ground this answer (for citations in UI)
    sources: [
      {
        documentName: String,
        page: Number,
        snippet: String,
      },
    ],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    title: { type: String, default: "New conversation" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
