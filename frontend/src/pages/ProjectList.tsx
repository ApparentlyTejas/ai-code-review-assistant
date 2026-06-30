import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboard";
import { createProject, listProjects } from "../api/projects";
import { ChevronRightIcon, FlagIcon, FolderIcon, RepoIcon, ReviewCheckIcon } from "../components/Icons";
import { pageTransition } from "../components/pageTransition";
import { Spinner } from "../components/Spinner";
import { useToast } from "../components/Toast";
import { usePageTitle } from "../hooks/usePageTitle";
import type { FindingSeverity } from "../types";

const SEVERITY_ORDER: FindingSeverity[] = ["critical", "high", "medium", "low"];

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ProjectList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  usePageTitle("Dashboard");

  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });

  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [githubPat, setGithubPat] = useState("");
  const [showConnectForm, setShowConnectForm] = useState(false);

  const hasNoProjects = projects?.length === 0;
  const isFormOpen = showConnectForm || hasNoProjects;

  const createMutation = useMutation({
    mutationFn: () => createProject(repoOwner, repoName, githubPat),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setRepoOwner("");
      setRepoName("");
      setGithubPat("");
      setShowConnectForm(false);
      toast(`${project.repo_owner}/${project.repo_name} connected successfully.`);
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      const detail = err.response?.data?.detail ?? "Failed to connect repo. Check the token and repo name.";
      toast(detail, "error");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <motion.div {...pageTransition}>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's been happening across your repos.</p>
        </div>
      </header>

      {summary && (
        <div className="stat-cards">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="stat-icon">
              <FolderIcon />
            </span>
            <span className="stat-value">{summary.total_projects}</span>
            <span className="stat-label">Projects</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <span className="stat-icon">
              <ReviewCheckIcon />
            </span>
            <span className="stat-value">{summary.total_reviews}</span>
            <span className="stat-label">Reviews run</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="stat-icon">
              <FlagIcon />
            </span>
            <span className="stat-value">{summary.total_findings}</span>
            <span className="stat-label">Findings flagged</span>
            {summary.total_findings > 0 && (
              <div className="stat-severity-breakdown">
                {SEVERITY_ORDER.filter((severity) => summary.findings_by_severity[severity]).map((severity) => (
                  <span key={severity} className={`badge severity-${severity}`}>
                    {summary.findings_by_severity[severity]} {severity}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      <div className="dashboard-grid">
        <section className="dashboard-main">
          <h2>Recent activity</h2>
          {summary && summary.recent_reviews.length === 0 ? (
            <div className="empty-state-box">
              <p>No reviews yet.</p>
              <p>Connect a repo and run your first review to see activity here.</p>
            </div>
          ) : (
            <ul className="recent-activity-list">
              {summary?.recent_reviews.map((review, index) => (
                <motion.li
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/projects/${review.project_id}/reviews/${review.id}`}>
                    <div className="recent-activity-main">
                      <span className="recent-activity-repo">
                        {review.repo_owner}/{review.repo_name}
                      </span>
                      <span className="recent-activity-pr">
                        #{review.pr_number} {review.pr_title}
                      </span>
                    </div>
                    <div className="recent-activity-meta">
                      <span className={`badge status-${review.status}`}>{review.status}</span>
                      <span className="recent-activity-findings">
                        {review.finding_count} {review.finding_count === 1 ? "finding" : "findings"}
                      </span>
                      <span className="recent-activity-time">{timeAgo(review.created_at)}</span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <aside className="dashboard-side">
          <div className="side-panel-header">
            <h2>Your projects</h2>
            {!hasNoProjects && (
              <button
                type="button"
                className="secondary small"
                onClick={() => setShowConnectForm((v) => !v)}
              >
                {showConnectForm ? "Cancel" : "+ Connect repo"}
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {isFormOpen && (
              <motion.form
                onSubmit={handleSubmit}
                className="connect-repo-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <label>
                  Repo owner
                  <input
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    placeholder="e.g. octocat"
                    required
                  />
                </label>
                <label>
                  Repo name
                  <input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g. Hello-World"
                    required
                  />
                </label>
                <label>
                  GitHub personal access token
                  <input
                    type="password"
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                    placeholder="ghp_..."
                    required
                  />
                </label>
                <button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Connecting..." : "Connect"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {isLoading && <Spinner label="Loading projects..." />}

          {!hasNoProjects && (
            <ul className="project-list">
              {projects?.map((project, index) => (
                <motion.li
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/projects/${project.id}`}>
                    <span className="project-list-icon">
                      <RepoIcon />
                    </span>
                    <span className="project-list-name">
                      {project.repo_owner}/{project.repo_name}
                    </span>
                    <span className="project-list-chevron">
                      <ChevronRightIcon />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </motion.div>
  );
}
