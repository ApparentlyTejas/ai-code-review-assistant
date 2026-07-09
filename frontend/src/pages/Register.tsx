import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { pageTransition } from "../components/pageTransition";

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser(email, password);
      await login(email, password);
      navigate("/projects");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div className="auth-page" {...pageTransition}>
      <Link to="/" style={{ display: "block", marginBottom: 28, fontWeight: 600, color: "var(--text)" }}>
        AI Code Review
      </Link>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </motion.div>
  );
}
