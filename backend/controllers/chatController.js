const Conversation = require("../models/Conversation");
const Document = require("../models/Document");
const aiServiceClient = require("../services/aiServiceClient");
const claudeService = require("../services/claudeService");

async function askQuestion(req, res, next) {
  try {
    const { question, documentId, conversationId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "A question is required" });
    }

    let document = null;
    if (documentId) {
      document = await Document.findOne({ _id: documentId, user: req.user._id });
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.status !== "ready") {
        return res.status(409).json({ message: "This document is still being processed" });
      }
    }

    // Load or create the conversation thread
    let conversation = conversationId
      ? await Conversation.findOne({ _id: conversationId, user: req.user._id })
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
        user: req.user._id,
        document: document ? document._id : null,
        title: question.slice(0, 60),
        messages: [],
      });
    }

    // 1. Retrieve relevant context chunks via the AI microservice (ChromaDB + embeddings)
    let contextChunks = [];
    if (document) {
      contextChunks = await aiServiceClient.retrieveContext({
        collectionName: document.collectionName,
        query: question,
        topK: 5,
      });
    }

    // 2. Build short rolling history for conversational context (last 6 messages)
    const history = conversation.messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Ask Claude, grounded in the retrieved context
    const answer = await claudeService.generateAnswer({ question, contextChunks, history });

    // 4. Persist both turns
    conversation.messages.push({ role: "user", content: question });
    conversation.messages.push({
      role: "assistant",
      content: answer,
      sources: contextChunks.map((c) => ({
        documentName: document ? document.originalName : "N/A",
        page: c.page,
        snippet: c.text?.slice(0, 200),
      })),
    });
    await conversation.save();

    res.json({
      conversationId: conversation._id,
      answer,
      sources: contextChunks,
    });
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title document createdAt updatedAt");
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

module.exports = { askQuestion, listConversations, getConversation };
