import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listPullRequests, triggerReview } from "../api/projects";
import { pageTransition } from "../components/pageTransition";
import { Spinner } from "../components/Spinner";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  const { data: pulls, isLoading } = useQuery({
    queryKey: ["pulls", id],
    queryFn: () => listPullRequests(id),
  });

  const reviewMutation = useMutation({
    mutationFn: (prNumber: number) => triggerReview(id, prNumber),
    onSuccess: (review) => navigate(`/projects/${id}/reviews/${review.id}`),
  });

  return (
    <motion.div {...pageTransition}>
      <header className="page-header">
        <h1>Open pull requests</h1>
        <Link to={`/projects/${id}/reviews`}>View review history</Link>
      </header>

      {isLoading && <Spinner label="Loading pull requests..." />}
      {reviewMutation.isError && <p className="error">Failed to start review.</p>}
      {reviewMutation.isPending && <Spinner label="Running AI review, this can take up to ~20 seconds..." />}

      <ul className="pull-request-list">
        {pulls?.map((pr, index) => (
          <motion.li
            key={pr.number}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div>
              <strong>
                #{pr.number} {pr.title}
              </strong>
              <span> by {pr.author}</span>
            </div>
            <button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate(pr.number)}>
              Review this PR
            </button>
          </motion.li>
        ))}
        {pulls?.length === 0 && <p>No open pull requests found.</p>}
      </ul>

      <p>
        <Link to="/projects">Back to projects</Link>
      </p>
    </motion.div>
  );
}
