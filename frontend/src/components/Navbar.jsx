import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 32px",
      }}
    >
      <NavLink
        to="/"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      >
        <span
          className="clay-raised-sm"
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
          aria-hidden
        >
          📚
        </span>
        <span className="font-display" style={{ fontSize: 22, color: "var(--ink-900)" }}>
          StudyMate <span style={{ color: "var(--accent-indigo)" }}>AI</span>
        </span>
      </NavLink>

      {user && (
        <nav style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            Dashboard
          </NavLink>
          <NavLink to="/chat" style={({ isActive }) => navLinkStyle(isActive)}>
            Study Chat
          </NavLink>
          <span style={{ color: "var(--ink-500)", fontSize: 14, marginLeft: 6 }}>
            Hi, {user.name.split(" ")[0]}
          </span>
          <button className="clay-btn clay-btn-danger-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}

function navLinkStyle(isActive) {
  return {
    padding: "8px 16px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    color: isActive ? "var(--accent-indigo-dark)" : "var(--ink-500)",
    background: isActive ? "rgba(91,110,232,0.12)" : "transparent",
  };
}
