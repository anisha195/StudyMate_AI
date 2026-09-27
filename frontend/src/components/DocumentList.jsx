import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_LABEL = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export default function DocumentList({ documents, onDeleted }) {
  const navigate = useNavigate();

  async function handleDelete(id) {
    if (!confirm("Remove this document and its indexed content?")) return;
    await api.delete(`/documents/${id}`);
    onDeleted?.(id);
  }

  if (!documents.length) {
    return (
      <p style={{ color: "var(--ink-500)", fontSize: 14 }}>
        No materials yet — upload your first PDF to start asking questions about it.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
      {documents.map((doc) => (
        <li
          key={doc._id}
          className="clay-raised-sm"
          style={{
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>📘</span>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 260,
                }}
                title={doc.originalName}
              >
                {doc.originalName}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-500)" }}>
                {doc.subject} · {doc.pageCount || 0} pages · {doc.chunkCount || 0} chunks indexed
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span className={`clay-pill clay-pill-${doc.status}`}>{STATUS_LABEL[doc.status]}</span>
            <button
              className="clay-btn clay-btn-primary"
              disabled={doc.status !== "ready"}
              onClick={() => navigate("/chat", { state: { documentId: doc._id, documentName: doc.originalName } })}
            >
              Ask
            </button>
            <button className="clay-btn clay-btn-danger-ghost" onClick={() => handleDelete(doc._id)}>
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
