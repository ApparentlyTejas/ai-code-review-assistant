import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { pageTransition } from "../components/pageTransition";

type State = "verifying" | "success" | "error";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login: _login } = useAuth();
  const [state, setState] = useState<State>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        // Cookie is set by the backend — sync auth state
        sessionStorage.setItem("auth_active", "1");
        setState("success");
        setTimeout(() => navigate("/projects"), 2000);
      })
      .catch((err: any) => {
        const detail = err?.response?.data?.detail ?? "Invalid or expired verification link.";
        setErrorMsg(detail);
        setState("error");
      });
  }, []);

  return (
    <motion.div className="auth-page" {...pageTransition}>
      <div className="auth-card" style={{ textAlign: "center" }}>
        {state === "verifying" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h1>Verifying…</h1>
            <p className="auth-page-subtitle" style={{ marginBottom: 0 }}>Just a moment while we confirm your email.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h1>Email verified!</h1>
            <p className="auth-page-subtitle" style={{ marginBottom: 0 }}>Your account is active. Taking you to your projects…</p>
          </>
        )}

        {state === "error" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <h1>Verification failed</h1>
            <p className="auth-page-subtitle">{errorMsg}</p>
            <Link to="/register">Register again</Link>
            {" · "}
            <Link to="/login">Sign in</Link>
          </>
        )}
      </div>
    </motion.div>
  );
}
