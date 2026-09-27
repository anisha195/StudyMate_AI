import { useEffect, useState } from "react";
import api from "../api/axios";
import ClayCard from "../components/ClayCard.jsx";
import FileUpload from "../components/FileUpload.jsx";
import DocumentList from "../components/DocumentList.jsx";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const { data } = await api.get("/documents");
      setDocuments(data.documents);
    } finally {
      setLoading(false);
    }
  }

  function handleUploaded(doc) {
    setDocuments((docs) => [doc, ...docs]);
  }

  function handleDeleted(id) {
    setDocuments((docs) => docs.filter((d) => d._id !== id));
  }

  return (
    <div className="app-main">
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 30 }}>
          Your study library
        </h1>
        <p style={{ color: "var(--ink-500)", margin: "6px 0 0" }}>
          Upload lecture notes, textbook chapters, or past papers — StudyMate AI indexes
          them so you can ask questions and get answers grounded in your own material.
        </p>
      </div>

      <div className="dashboard-grid">
        <ClayCard>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Upload a document</h3>
          <FileUpload onUploaded={handleUploaded} />
        </ClayCard>

        <ClayCard>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Your materials</h3>
          {loading ? (
            <div className="clay-thinking">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <DocumentList documents={documents} onDeleted={handleDeleted} />
          )}
        </ClayCard>
      </div>
    </div>
  );
}
