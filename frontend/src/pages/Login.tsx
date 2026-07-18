import { useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { pageTransition } from "../components/pageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

export function Login() {
  const { login, loginGoogle } = useAuth();
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
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setError("Please verify your email before logging in. Check your inbox.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      setError(null);
      setIsSubmitting(true);
      try {
        await loginGoogle(response.access_token);
        navigate("/projects");
      } catch {
        setError("Google sign-in failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  return (
    <motion.div className="auth-page" {...pageTransition}>
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0071e3" />
            <path d="M12 28L20 12L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 23H25.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="auth-brand-name">ReviewLenzAI</span>
        </Link>

        <h1>Sign in</h1>
        <p className="auth-page-subtitle">Use your ReviewLenzAI account</p>

        {sessionExpired && (
          <p className="session-expired-banner">Your session expired. Please sign in again.</p>
        )}

        <button
          className="google-btn"
          type="button"
          disabled={isSubmitting}
          onClick={() => handleGoogle()}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)", margin: "16px 0 0" }}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </motion.div>
  );
}
