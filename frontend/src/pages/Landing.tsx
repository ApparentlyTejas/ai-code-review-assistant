import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "../components/ScrollReveal";
import { useAuth } from "../auth/AuthContext";

const TECH_STACK = ["Python", "FastAPI", "React", "PostgreSQL", "Groq", "Llama 3.3"];

export function Landing() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-nav-brand">AI Code Review</span>
        <div className="landing-nav-links">
          {user ? (
            <Link to="/projects" className="btn-pill" style={{ padding: "8px 18px", fontSize: 13 }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn-pill" style={{ padding: "8px 18px", fontSize: 13 }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="hero" ref={heroRef}>
        <motion.div className="hero-glow" style={{ y: glowY }} />
        <motion.div style={{ opacity: heroOpacity }}>
          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            AI-POWERED CODE REVIEW
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Every pull request.
            <br />
            Reviewed instantly.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Connect a GitHub repo, pick an open PR, and get structured, severity-ranked findings on bugs, security
            issues, and style — powered by a real LLM, not a linter.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link to={user ? "/projects" : "/register"} className="btn-pill">
              {user ? "Go to dashboard" : "Get started free"}
            </Link>
            {!user && (
              <Link to="/login" className="btn-pill outline">
                Log in
              </Link>
            )}
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Scroll to explore ↓
        </motion.div>
      </div>

      <section className="section">
        <ScrollReveal>
          <p className="section-eyebrow">CONNECT</p>
          <h2>Your repos, securely connected.</h2>
          <p className="lead">
            Authenticate with a personal access token, and we'll validate access before anything's stored.
          </p>
        </ScrollReveal>
        <div className="feature-grid">
          <ScrollReveal delay={0}>
            <div className="feature-card">
              <span className="feature-icon">🔗</span>
              <h3>One-click repo connect</h3>
              <p>Paste a GitHub personal access token and repo name — we validate real access via the GitHub API.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Encrypted at rest</h3>
              <p>Tokens are encrypted with Fernet before they ever touch the database, and never returned by the API.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="feature-card">
              <span className="feature-icon">👤</span>
              <h3>Your own account</h3>
              <p>Real email/password auth with JWT sessions — every project belongs to you, and only you.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-dark">
        <ScrollReveal>
          <p className="section-eyebrow">REVIEW</p>
          <h2>Findings that read like a senior engineer wrote them.</h2>
          <p className="lead">
            Each pull request diff is sent to an LLM with a structured tool schema, so every finding comes back
            categorized, severity-ranked, and grounded in the actual diff — not guesswork.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="mock-finding-card">
            <div className="finding-header">
              <span className="badge">security</span>
              <span className="badge">critical</span>
              <code>app/services/db.py:42</code>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 15 }}>
              User input is concatenated directly into a SQL query, exposing the endpoint to injection attacks.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-on-dark-secondary)" }}>
              Suggested fix: use parameterized queries via the driver's placeholder syntax.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="section">
        <ScrollReveal>
          <p className="section-eyebrow">STACK</p>
          <h2>Built end-to-end, no shortcuts.</h2>
          <p className="lead">A real full-stack app: relational schema, JWT auth, encrypted secrets, and a live LLM in the loop.</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {TECH_STACK.map((tech) => (
              <span key={tech} className="badge" style={{ fontSize: 13, padding: "8px 18px" }}>
                {tech}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="cta-section">
        <ScrollReveal>
          <h2>Try it on your own repo.</h2>
          <Link to={user ? "/projects" : "/register"} className="btn-pill" style={{ background: "var(--accent)", color: "#fff" }}>
            {user ? "Go to dashboard" : "Get started free"}
          </Link>
        </ScrollReveal>
      </section>

      <footer className="landing-footer">
        AI Code Review Assistant — a portfolio project. Built with FastAPI, React, and Groq.
      </footer>
    </div>
  );
}
