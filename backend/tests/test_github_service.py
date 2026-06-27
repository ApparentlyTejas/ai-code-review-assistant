from unittest.mock import MagicMock, patch

import pytest

from app.services import github_service


def _mock_response(status_code, json_data=None, text_data=None):
    mock = MagicMock()
    mock.status_code = status_code
    if json_data is not None:
        mock.json.return_value = json_data
    if text_data is not None:
        mock.text = text_data
    mock.raise_for_status = MagicMock()
    return mock


@patch("app.services.github_service.httpx.get")
def test_validate_repo_access_success(mock_get):
    mock_get.return_value = _mock_response(200, json_data={})
    github_service.validate_repo_access("fake-pat", "owner", "repo")


@patch("app.services.github_service.httpx.get")
def test_validate_repo_access_invalid_token_raises_auth_error(mock_get):
    mock_get.return_value = _mock_response(401)
    with pytest.raises(github_service.GitHubAuthError):
        github_service.validate_repo_access("bad-pat", "owner", "repo")


@patch("app.services.github_service.httpx.get")
def test_validate_repo_access_missing_repo_raises_not_found(mock_get):
    mock_get.return_value = _mock_response(404)
    with pytest.raises(github_service.GitHubNotFoundError):
        github_service.validate_repo_access("fake-pat", "owner", "doesnotexist")


@patch("app.services.github_service.httpx.get")
def test_list_open_pull_requests_parses_fields(mock_get):
    mock_get.return_value = _mock_response(
        200,
        json_data=[
            {
                "number": 1,
                "title": "Fix bug",
                "html_url": "https://github.com/o/r/pull/1",
                "user": {"login": "octocat"},
                "updated_at": "2024-01-01T00:00:00Z",
            }
        ],
    )
    pulls = github_service.list_open_pull_requests("fake-pat", "owner", "repo")
    assert len(pulls) == 1
    assert pulls[0] == {
        "number": 1,
        "title": "Fix bug",
        "url": "https://github.com/o/r/pull/1",
        "author": "octocat",
        "updated_at": "2024-01-01T00:00:00Z",
    }


@patch("app.services.github_service.httpx.get")
def test_list_open_pull_requests_invalid_token_raises(mock_get):
    mock_get.return_value = _mock_response(401)
    with pytest.raises(github_service.GitHubAuthError):
        github_service.list_open_pull_requests("bad-pat", "owner", "repo")


@patch("app.services.github_service.httpx.get")
def test_get_pull_request_diff_returns_raw_text(mock_get):
    mock_get.return_value = _mock_response(200, text_data="diff --git a/x b/x\n+added line\n")
    diff = github_service.get_pull_request_diff("fake-pat", "owner", "repo", 1)
    assert diff.startswith("diff --git")


@patch("app.services.github_service.httpx.get")
def test_get_pull_request_diff_missing_pr_raises_not_found(mock_get):
    mock_get.return_value = _mock_response(404)
    with pytest.raises(github_service.GitHubNotFoundError):
        github_service.get_pull_request_diff("fake-pat", "owner", "repo", 999)
