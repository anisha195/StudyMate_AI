import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import ClayCard from "../components/ClayCard.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <ClayCard style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 34 }}>📚</div>
          <h1 className="font-display" style={{ fontSize: 26, marginTop: 8 }}>
            Create your account
          </h1>
          <p style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 6 }}>
            Upload your notes. Ask anything. Study smarter.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            className="clay-input"
            placeholder="Full name"
            value={form.name}
            onChange={update("name")}
            required
          />
          <input
            className="clay-input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            className="clay-input"
            type="password"
            placeholder="Password (min. 6 characters)"
            value={form.password}
            onChange={update("password")}
            minLength={6}
            required
          />

          {error && <p style={{ color: "var(--accent-danger)", fontSize: 13, margin: 0 }}>{error}</p>}

          <button className="clay-btn clay-btn-primary" disabled={loading} type="submit">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-500)", marginTop: 18 }}>
          Already have an account? <Link to="/login" style={{ color: "var(--accent-indigo)" }}>Log in</Link>
        </p>
      </ClayCard>
    </div>
  );
}
