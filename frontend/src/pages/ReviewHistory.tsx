import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { listReviews } from "../api/projects";

export function ReviewHistory() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => listReviews(id),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="page-header">
        <h1>Review history</h1>
      </header>

      {isLoading && <p>Loading...</p>}

      <ul className="review-history-list">
        {reviews?.map((review, index) => (
          <motion.li
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link to={`/projects/${id}/reviews/${review.id}`}>
              PR #{review.pr_number}: {review.pr_title}
            </Link>
            <span className={`badge status-${review.status}`}>{review.status}</span>
            <span>{review.finding_count} findings</span>
            <span>{new Date(review.created_at).toLocaleString()}</span>
          </motion.li>
        ))}
        {reviews?.length === 0 && <p>No reviews yet.</p>}
      </ul>

      <p>
        <Link to={`/projects/${id}`}>Back to pull requests</Link>
      </p>
    </motion.div>
  );
}
