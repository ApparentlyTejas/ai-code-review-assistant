import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { Logo } from "../components/Logo";

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

  async function handleGoogleSuccess(accessToken: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginGoogle(accessToken);
      navigate("/projects");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-dark">
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />
        <motion.div
          className="auth-glass"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div style={{ fontSize: 48, marginBottom: 18 }}>📬</div>
          <h1>Check your inbox</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: "8px 0 28px" }}>
            We sent a verification link to<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{email}</span>
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Already verified?{" "}
            <Link to="/login" style={{ color: "rgba(255,255,255,0.65)" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-dark">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />
      <div className="auth-glow-3" />

      <motion.div
        className="auth-glass"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link to="/" className="auth-glass-brand">
          <Logo size={28} />
          ReviewLenzAI
        </Link>

        <h1>Create account</h1>
        <p className="auth-dark-sub">Start reviewing code with AI</p>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
          disabled={isSubmitting}
        />

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isSubmitting} style={{ width: "100%", marginTop: 4 }}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.35)", margin: "20px 0 0" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "rgba(255,255,255,0.75)" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
