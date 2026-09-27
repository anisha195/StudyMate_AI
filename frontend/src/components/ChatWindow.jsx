import ReactMarkdown from "react-markdown";

export default function ChatWindow({ messages, thinking, bottomRef }) {
  if (!messages.length && !thinking) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-500)",
          gap: 8,
          textAlign: "center",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 40 }}>💬</div>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--ink-700)" }}>
          Ask anything about your uploaded material
        </p>
        <p style={{ margin: 0, fontSize: 13, maxWidth: 320 }}>
          StudyMate AI answers strictly from your notes and textbooks, and tells you
          when something isn't covered.
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 4px", display: "grid", gap: 16 }}>
      {messages.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}

      {thinking && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div className="clay-raised-sm clay-thinking">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        className={isUser ? "" : "clay-raised-sm"}
        style={{
          maxWidth: "78%",
          padding: "14px 18px",
          borderRadius: 20,
          background: isUser
            ? "linear-gradient(145deg, var(--accent-indigo), var(--accent-indigo-dark))"
            : undefined,
          color: isUser ? "white" : "var(--ink-900)",
          fontSize: 14.5,
          lineHeight: 1.55,
        }}
      >
        <div className="markdown-body">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {!isUser && message.sources?.length > 0 && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(108,114,147,0.18)",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {message.sources.map((s, idx) => (
              <span
                key={idx}
                className="clay-pill"
                style={{ background: "rgba(91,110,232,0.1)", color: "var(--accent-indigo-dark)" }}
                title={s.snippet}
              >
                Source {idx + 1} · p.{s.page ?? "?"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
