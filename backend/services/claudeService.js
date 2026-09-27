const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
/**
 * Builds a grounded system prompt instructing Claude to answer strictly
 * from the retrieved study material context, and to say so when the
 * material doesn't cover the question.
 */
function buildSystemPrompt(contextChunks) {
  const context = contextChunks
    .map((c, i) => `[Source ${i + 1} — page ${c.page ?? "?"}]\n${c.text}`)
    .join("\n\n---\n\n");

  return `You are StudyMate AI, a focused academic study assistant.
Answer the student's question using ONLY the context excerpts below, which come
from the student's own uploaded materials. If the context does not contain
enough information to answer confidently, say so plainly and suggest what
part of their notes might help, rather than guessing.

Keep answers clear and exam-oriented: define terms, use short paragraphs or
bullet points where useful, and reference which source number you drew from
(e.g. "(Source 2)") so the student can look it up in their own notes.

CONTEXT EXCERPTS:
${context || "(no relevant excerpts were found in the uploaded material)"}`;
}

/**
 * Generates an answer grounded in retrieved context, given the running
 * chat history for conversational follow-ups.
 */
async function generateAnswer({ question, contextChunks, history = [] }) {
  const systemPrompt = buildSystemPrompt(contextChunks);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages,
  });

  return response.choices[0]?.message?.content || "";
}
module.exports = {
  generateAnswer,
};