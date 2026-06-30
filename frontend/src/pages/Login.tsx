import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { pageTransition } from "../components/pageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  usePageTitle("Log in");

  useEffect(() => {
    if (sessionStorage.getItem("session_expired")) {
      setSessionExpired(true);
      sessionStorage.removeItem("session_expired");
    }
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/projects");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div className="auth-page" {...pageTransition}>
      <Link to="/" style={{ display: "block", marginBottom: 28, fontWeight: 600, color: "var(--text)" }}>
        AI Code Review
      </Link>
      {sessionExpired && (
        <p className="session-expired-banner">Your session expired. Please log in again.</p>
      )}
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </motion.div>
  );
}
