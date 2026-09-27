import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="clay-thinking" aria-label="Loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
