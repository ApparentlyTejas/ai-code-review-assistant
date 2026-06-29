import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "../components/ScrollReveal";
import { ConnectIcon, LockIcon, UserIcon } from "../components/Icons";
import { useAuth } from "../auth/AuthContext";

const TECH_STACK = ["Python", "FastAPI", "React", "PostgreSQL", "Groq", "Llama 3.3"];

export function Landing() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <motion.div className="landing" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
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
        <motion.div className="hero-content" style={{ opacity: heroOpacity, scale: heroScale }}>
          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            AI POWERED CODE REVIEW
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
            Connect a GitHub repo, pick an open pull request, and get back structured findings on bugs, security
            issues, and style, ranked by severity.
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
          <h2>Your repo, connected safely.</h2>
          <p className="lead">
            Add a GitHub personal access token. Real access is confirmed through the GitHub API before anything
            is saved.
          </p>
        </ScrollReveal>
        <div className="feature-grid">
          <ScrollReveal delay={0}>
            <div className="feature-card">
              <span className="feature-icon">
                <ConnectIcon />
              </span>
              <h3>One-step connect</h3>
              <p>Paste a personal access token and a repo name. Access is checked through the GitHub API first.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="feature-card">
              <span className="feature-icon">
                <LockIcon />
              </span>
              <h3>Encrypted at rest</h3>
              <p>Tokens are encrypted with Fernet before they're stored, and the API never sends them back.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="feature-card">
              <span className="feature-icon">
                <UserIcon />
              </span>
              <h3>Your own account</h3>
              <p>Sign in with email and password. Every project you connect stays private to your account.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-dark">
        <ScrollReveal>
          <p className="section-eyebrow">REVIEW</p>
          <h2>Findings that read like a real review.</h2>
          <p className="lead">
            Each diff is sent to an LLM with a structured schema, so findings come back categorized, ranked by
            severity, and tied to a real line in the code.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="mock-finding-wrapper">
            <div className="mock-finding-glow" />
            <div className="mock-finding-card">
              <div className="mock-finding-chrome">
                <span className="mock-finding-dot" style={{ background: "#ff5f57" }} />
                <span className="mock-finding-dot" style={{ background: "#febc2e" }} />
                <span className="mock-finding-dot" style={{ background: "#28c840" }} />
                <span className="mock-finding-chrome-label">Review result</span>
              </div>
              <div className="mock-finding-body">
                <div className="finding-header">
                  <span className="badge">security</span>
                  <span className="badge">critical</span>
                  <code>app/services/db.py:42</code>
                </div>
                <p style={{ margin: 0 }}>
                  User input is concatenated directly into a SQL query, exposing the endpoint to injection attacks.
                </p>
                <p className="mock-finding-fix">
                  Suggested fix: use parameterized queries via the driver's placeholder syntax.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="section">
        <ScrollReveal>
          <p className="section-eyebrow">STACK</p>
          <h2>The stack behind it.</h2>
          <p className="lead">A relational schema, JWT auth, encrypted secrets, and a live LLM in the review loop.</p>
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
        AI Code Review Assistant. A portfolio project built with FastAPI, React, and Groq.
      </footer>
    </motion.div>
  );
}
