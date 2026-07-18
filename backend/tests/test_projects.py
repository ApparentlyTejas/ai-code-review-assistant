from unittest.mock import patch

from tests.conftest import register_and_login as _register_and_login


@patch("app.routers.projects.github_service.validate_repo_access")
def test_create_project_success(mock_validate, client):
    headers = _register_and_login(client, "owner@example.com")
    response = client.post(
        "/projects",
        json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"},
        headers=headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["repo_owner"] == "octocat"
    assert "github_pat" not in body
    assert "encrypted_pat" not in body


@patch("app.routers.projects.github_service.validate_repo_access")
def test_list_projects_only_returns_own_projects(mock_validate, client):
    headers_a = _register_and_login(client, "a@example.com")
    headers_b = _register_and_login(client, "b@example.com")

    client.post(
        "/projects",
        json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"},
        headers=headers_a,
    )

    response = client.get("/projects", headers=headers_b)
    assert response.status_code == 200
    assert response.json() == []


@patch("app.routers.projects.github_service.validate_repo_access")
def test_user_cannot_access_other_users_project(mock_validate, client):
    headers_a = _register_and_login(client, "owner2@example.com")
    headers_b = _register_and_login(client, "intruder@example.com")

    create_resp = client.post(
        "/projects",
        json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"},
        headers=headers_a,
    )
    project_id = create_resp.json()["id"]

    response = client.get(f"/projects/{project_id}/pulls", headers=headers_b)
    assert response.status_code == 404


def test_create_project_requires_auth(client):
    response = client.post(
        "/projects", json={"repo_owner": "octocat", "repo_name": "Hello-World", "github_pat": "ghp_fake"}
    )
    assert response.status_code == 401
