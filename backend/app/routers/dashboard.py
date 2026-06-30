from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.finding import Finding
from app.models.project import Project
from app.models.review import Review
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.dashboard import DashboardSummary, RecentReviewOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardSummary:
    project_ids = [pid for (pid,) in db.query(Project.id).filter(Project.user_id == current_user.id).all()]

    if not project_ids:
        return DashboardSummary(
            total_projects=0, total_reviews=0, total_findings=0, findings_by_severity={}, recent_reviews=[]
        )

    total_reviews = db.query(Review).filter(Review.project_id.in_(project_ids)).count()

    total_findings = (
        db.query(Finding).join(Review, Finding.review_id == Review.id).filter(Review.project_id.in_(project_ids)).count()
    )

    severity_counts = (
        db.query(Finding.severity, func.count(Finding.id))
        .join(Review, Finding.review_id == Review.id)
        .filter(Review.project_id.in_(project_ids))
        .group_by(Finding.severity)
        .all()
    )
    findings_by_severity = {severity.value: count for severity, count in severity_counts}

    recent = (
        db.query(Review, Project)
        .join(Project, Review.project_id == Project.id)
        .filter(Review.project_id.in_(project_ids))
        .order_by(Review.created_at.desc())
        .limit(5)
        .all()
    )
    recent_reviews = [
        RecentReviewOut(
            id=review.id,
            project_id=project.id,
            repo_owner=project.repo_owner,
            repo_name=project.repo_name,
            pr_number=review.pr_number,
            pr_title=review.pr_title,
            status=review.status.value,
            finding_count=len(review.findings),
            created_at=review.created_at,
        )
        for review, project in recent
    ]

    return DashboardSummary(
        total_projects=len(project_ids),
        total_reviews=total_reviews,
        total_findings=total_findings,
        findings_by_severity=findings_by_severity,
        recent_reviews=recent_reviews,
    )
