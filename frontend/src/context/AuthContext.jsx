import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("studymate_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studymate_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate the token still works and refresh the cached user
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("studymate_user", JSON.stringify(data.user));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("studymate_token", token);
    localStorage.setItem("studymate_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("studymate_token");
    localStorage.removeItem("studymate_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
