import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function GitHubCallback() {
  const { loginGitHub } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      navigate("/login");
      return;
    }

    loginGitHub(code)
      .then(() => navigate("/projects"))
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div className="auth-dark" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Signing in with GitHub…</div>
    </div>
  );
}
