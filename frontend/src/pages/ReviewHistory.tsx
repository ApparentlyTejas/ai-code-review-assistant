import { useQuery } from "@tanstack/react-query";
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
    <div>
      <header className="page-header">
        <h1>Review history</h1>
      </header>

      {isLoading && <p>Loading...</p>}

      <ul className="review-history-list">
        {reviews?.map((review) => (
          <li key={review.id}>
            <Link to={`/projects/${id}/reviews/${review.id}`}>
              PR #{review.pr_number}: {review.pr_title}
            </Link>
            <span className={`status status-${review.status}`}>{review.status}</span>
            <span>{review.finding_count} findings</span>
            <span>{new Date(review.created_at).toLocaleString()}</span>
          </li>
        ))}
        {reviews?.length === 0 && <p>No reviews yet.</p>}
      </ul>

      <p>
        <Link to={`/projects/${id}`}>Back to pull requests</Link>
      </p>
    </div>
  );
}
