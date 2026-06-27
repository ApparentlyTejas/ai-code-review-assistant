import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { getReview } from "../api/projects";
import type { Finding } from "../types";

const SEVERITY_ORDER: Record<Finding["severity"], number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function ReviewDetail() {
  const { projectId, reviewId } = useParams<{ projectId: string; reviewId: string }>();
  const id = Number(projectId);
  const rId = Number(reviewId);

  const { data: review, isLoading } = useQuery({
    queryKey: ["review", id, rId],
    queryFn: () => getReview(id, rId),
  });

  if (isLoading) return <p>Loading review...</p>;
  if (!review) return <p>Review not found.</p>;

  const sortedFindings = [...review.findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="page-header">
        <h1>
          PR #{review.pr_number}: {review.pr_title}
        </h1>
        <a href={review.pr_url} target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </header>

      <p>
        Status: <strong>{review.status}</strong> &middot; Model: {review.model_used}
      </p>

      {review.status === "failed" && <p className="error">Review failed: {review.error_message}</p>}

      {review.status === "completed" && sortedFindings.length === 0 && <p>No issues found. Clean diff!</p>}

      <ul className="finding-list">
        {sortedFindings.map((finding, index) => (
          <motion.li
            key={finding.id}
            className={`finding finding-${finding.severity}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <div className="finding-header">
              <span className="badge badge-category">{finding.category}</span>
              <span className="badge badge-severity">{finding.severity}</span>
              <code>
                {finding.file_path}
                {finding.line_number ? `:${finding.line_number}` : ""}
              </code>
            </div>
            <p>{finding.message}</p>
            {finding.suggested_fix && (
              <details>
                <summary>Suggested fix</summary>
                <pre>{finding.suggested_fix}</pre>
              </details>
            )}
          </motion.li>
        ))}
      </ul>

      <p>
        <Link to={`/projects/${id}`}>Back to pull requests</Link>
      </p>
    </motion.div>
  );
}
