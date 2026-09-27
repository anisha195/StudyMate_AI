import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import ClayCard from "../components/ClayCard.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <ClayCard style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 34 }}>📚</div>
          <h1 className="font-display" style={{ fontSize: 26, marginTop: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 6 }}>
            Pick up right where your notes left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
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
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            required
          />

          {error && <p style={{ color: "var(--accent-danger)", fontSize: 13, margin: 0 }}>{error}</p>}

          <button className="clay-btn clay-btn-primary" disabled={loading} type="submit">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-500)", marginTop: 18 }}>
          New here? <Link to="/register" style={{ color: "var(--accent-indigo)" }}>Create an account</Link>
        </p>
      </ClayCard>
    </div>
  );
}
