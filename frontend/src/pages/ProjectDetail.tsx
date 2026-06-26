import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listPullRequests, triggerReview } from "../api/projects";

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
    <div>
      <header className="page-header">
        <h1>Open pull requests</h1>
        <Link to={`/projects/${id}/reviews`}>View review history</Link>
      </header>

      {isLoading && <p>Loading pull requests...</p>}
      {reviewMutation.isError && <p className="error">Failed to start review.</p>}
      {reviewMutation.isPending && <p>Running AI review, this can take up to ~20 seconds...</p>}

      <ul className="pull-request-list">
        {pulls?.map((pr) => (
          <li key={pr.number}>
            <div>
              <strong>
                #{pr.number} {pr.title}
              </strong>
              <span> by {pr.author}</span>
            </div>
            <button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate(pr.number)}>
              Review this PR
            </button>
          </li>
        ))}
        {pulls?.length === 0 && <p>No open pull requests found.</p>}
      </ul>

      <p>
        <Link to="/projects">Back to projects</Link>
      </p>
    </div>
  );
}
