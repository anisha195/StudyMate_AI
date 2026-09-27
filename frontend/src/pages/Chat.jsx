import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import ClayCard from "../components/ClayCard.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function Chat() {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(location.state?.documentId || "");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/documents").then(({ data }) => {
      setDocuments(data.documents.filter((d) => d.status === "ready"));
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;

    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setThinking(true);
    setError("");

    try {
      const { data } = await api.post("/chat/ask", {
        question,
        documentId: documentId || undefined,
        conversationId,
      });
      setConversationId(data.conversationId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="app-main" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 26 }}>
            Study Chat
          </h1>
          <p style={{ color: "var(--ink-500)", margin: "4px 0 0", fontSize: 14 }}>
            Answers are grounded in the material you choose below.
          </p>
        </div>

        <select
          className="clay-input"
          style={{ maxWidth: 260 }}
          value={documentId}
          onChange={(e) => {
            setDocumentId(e.target.value);
            setConversationId(null);
            setMessages([]);
          }}
        >
          <option value="">All materials (general Q&A)</option>
          {documents.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.originalName}
            </option>
          ))}
        </select>
      </div>

      <ClayCard style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 20 }}>
        <ChatWindow messages={messages} thinking={thinking} bottomRef={bottomRef} />

        {error && <p style={{ color: "var(--accent-danger)", fontSize: 13, margin: "8px 0 0" }}>{error}</p>}

        <form onSubmit={handleSend} style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <input
            className="clay-input"
            placeholder="Ask about your notes… e.g. 'Summarize chapter 3'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="clay-btn clay-btn-highlight" type="submit" disabled={thinking || !input.trim()}>
            Send
          </button>
        </form>
      </ClayCard>
    </div>
  );
}
