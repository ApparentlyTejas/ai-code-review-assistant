from unittest.mock import patch

from app.models.finding import Finding, FindingCategory, FindingSeverity
from app.models.review import Review, ReviewStatus
from tests.conftest import register_and_login as _register_and_login


def test_summary_with_no_projects_returns_zeros(client):
    headers = _register_and_login(client, "empty@example.com")
    response = client.get("/dashboard/summary", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body == {
        "total_projects": 0,
        "total_reviews": 0,
        "total_findings": 0,
        "findings_by_severity": {},
        "recent_reviews": [],
    }


@patch("app.routers.projects.github_service.validate_repo_access")
def test_summary_counts_reviews_and_findings(mock_validate, client, db_session):
    headers = _register_and_login(client, "stats@example.com")

    create_resp = client.post(
        "/projects",
        json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"},
        headers=headers,
    )
    project_id = create_resp.json()["id"]

    review = Review(
        project_id=project_id,
        pr_number=1,
        pr_title="Test PR",
        pr_url="https://github.com/octocat/Hello-World/pull/1",
        diff_snapshot="diff",
        status=ReviewStatus.completed,
        model_used="llama-3.3-70b-versatile",
    )
    db_session.add(review)
    db_session.commit()
    db_session.refresh(review)

    db_session.add_all(
        [
            Finding(
                review_id=review.id,
                category=FindingCategory.security,
                severity=FindingSeverity.critical,
                file_path="app.py",
                message="SQL injection",
            ),
            Finding(
                review_id=review.id,
                category=FindingCategory.style,
                severity=FindingSeverity.low,
                file_path="app.py",
                message="Naming",
            ),
        ]
    )
    db_session.commit()

    response = client.get("/dashboard/summary", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["total_projects"] == 1
    assert body["total_reviews"] == 1
    assert body["total_findings"] == 2
    assert body["findings_by_severity"] == {"critical": 1, "low": 1}
    assert len(body["recent_reviews"]) == 1
    assert body["recent_reviews"][0]["pr_title"] == "Test PR"
    assert body["recent_reviews"][0]["finding_count"] == 2


@patch("app.routers.projects.github_service.validate_repo_access")
def test_summary_excludes_other_users_data(mock_validate, client):
    headers_a = _register_and_login(client, "ownerx@example.com")
    headers_b = _register_and_login(client, "ownery@example.com")

    client.post(
        "/projects",
        json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"},
        headers=headers_a,
    )

    response = client.get("/dashboard/summary", headers=headers_b)
    assert response.status_code == 200
    assert response.json()["total_projects"] == 0


def test_summary_requires_auth(client):
    response = client.get("/dashboard/summary")
    assert response.status_code == 401
