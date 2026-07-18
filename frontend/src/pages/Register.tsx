import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, resendVerification } from "../api/auth";
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
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

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

  async function handleResend() {
    setResendStatus("sending");
    try {
      await resendVerification(email);
    } catch {
      // silently fail — backend returns 204 regardless
    }
    setResendStatus("sent");
    setTimeout(() => setResendStatus("idle"), 30_000);
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
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: "8px 0 20px" }}>
            We sent a verification link to<br />
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{email}</span>
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus !== "idle"}
            style={{ width: "100%", marginBottom: 16, background: "rgba(255,255,255,0.08)", color: resendStatus === "sent" ? "#34c759" : "rgba(255,255,255,0.7)" }}
          >
            {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "Email sent!" : "Resend verification email"}
          </button>
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
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" style={{ width: "100%", paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 4, cursor: "pointer", color: "rgba(255,255,255,0.4)", width: "auto" }}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
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
