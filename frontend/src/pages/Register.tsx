import { useGoogleLogin } from "@react-oauth/google";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="9" fill="#fff" fillOpacity="0.12" />
    <path d="M12 28L20 12L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 23H25.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export function Register() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser(email, password);
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError("An account with this email already exists. Try signing in.");
      } else if (status === 422) {
        const detail = err?.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
        setError(msg ?? "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
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

  if (submitted) {
    return (
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-dots" />
          <Link to="/" className="auth-left-brand"><LogoMark /> ReviewLenzAI</Link>
          <div className="auth-left-body">
            <p className="auth-left-eyebrow">AI Code Review</p>
            <h2>One step away.</h2>
            <p>Verify your email to activate your account and start reviewing code with AI.</p>
          </div>
        </div>
        <motion.div
          className="auth-right"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="auth-form-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
            <h1>Check your inbox</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 8 }}>
              We sent a verification link to<br /><strong style={{ color: "var(--text)" }}>{email}</strong>
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 32 }}>
              Already verified? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-split">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-dots" />

        <Link to="/" className="auth-left-brand">
          <LogoMark />
          ReviewLenzAI
        </Link>

        <div className="auth-left-body">
          <p className="auth-left-eyebrow">AI Code Review</p>
          <h2>Ship better code,<br />faster.</h2>
          <p>
            Catch bugs, security issues, and code smells before they reach
            production — in seconds, not hours.
          </p>

          <div className="auth-mock-card">
            <div className="auth-mock-badge">● Critical · Security</div>
            <div className="auth-mock-title">SQL Injection detected</div>
            <div className="auth-mock-desc">
              User input on line 42 is concatenated into a raw SQL query without
              sanitization. An attacker can exfiltrate or modify any row.
            </div>
            <div className="auth-mock-footer">
              <span className="auth-mock-file">auth/database.py:42</span>
              <span className="auth-mock-fix">+ Fix suggestion →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <motion.div
        className="auth-right"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="auth-form-box">
          <h1>Create account</h1>
          <p className="auth-form-subtitle">Start reviewing code with AI</p>

          <button className="google-btn" type="button" disabled={isSubmitting} onClick={() => handleGoogle()}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label>
              Password <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(min. 8 characters)</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={isSubmitting} style={{ width: "100%", marginTop: 4 }}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "20px 0 0", textAlign: "center" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
