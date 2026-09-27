import { useRef, useState } from "react";
import api from "../api/axios";

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("General");

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported right now.");
      return;
    }
    setError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("subject", subject);

    try {
      const { data } = await api.post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded?.(data.document);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          className="clay-input"
          style={{ maxWidth: 220 }}
          placeholder="Subject (e.g. Organic Chemistry)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div
        className="clay-inset"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "36px 20px",
          textAlign: "center",
          cursor: "pointer",
          border: dragging ? "2px dashed var(--accent-indigo)" : "2px dashed transparent",
          transition: "border-color 0.15s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="clay-thinking">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p style={{ color: "var(--ink-500)", margin: 0, fontSize: 14 }}>
              Reading your PDF and building its knowledge base…
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 34, marginBottom: 8 }}>📄</div>
            <p style={{ margin: 0, fontWeight: 600 }}>Drop a PDF here, or click to browse</p>
            <p style={{ margin: "4px 0 0", color: "var(--ink-500)", fontSize: 13 }}>
              Lecture notes, textbook chapters, past papers — up to 25MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p style={{ color: "var(--accent-danger)", fontSize: 13, marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}
