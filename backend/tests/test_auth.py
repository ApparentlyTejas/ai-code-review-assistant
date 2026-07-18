from tests.conftest import create_verified_user, register_and_login


def test_register_success(client):
    response = client.post("/auth/register", json={"email": "a@example.com", "password": "password123"})
    assert response.status_code == 201
    body = response.json()
    assert "message" in body
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_duplicate_email_rejected(client):
    client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    response = client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    assert response.status_code == 409


def test_login_success_returns_token(client):
    create_verified_user("login@example.com")
    response = client.post("/auth/login", json={"email": "login@example.com", "password": "password123"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_unverified_user_rejected(client):
    client.post("/auth/register", json={"email": "unverified@example.com", "password": "password123"})
    response = client.post("/auth/login", json={"email": "unverified@example.com", "password": "password123"})
    assert response.status_code == 403


def test_login_wrong_password_rejected(client):
    create_verified_user("wrong@example.com")
    response = client.post("/auth/login", json={"email": "wrong@example.com", "password": "incorrect"})
    assert response.status_code == 401


def test_login_unknown_email_rejected(client):
    response = client.post("/auth/login", json={"email": "nobody@example.com", "password": "password123"})
    assert response.status_code == 401


def test_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token_rejected(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer not.a.valid.token"})
    assert response.status_code == 401


def test_me_with_valid_token_returns_user(client):
    headers = register_and_login(client, "me@example.com")
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


def test_verify_email_success(client):
    from tests.conftest import TestingSessionLocal
    from app.models.user import User as UserModel

    client.post("/auth/register", json={"email": "verify@example.com", "password": "password123"})
    db = TestingSessionLocal()
    user = db.query(UserModel).filter(UserModel.email == "verify@example.com").first()
    token = user.verification_token
    db.close()

    response = client.get(f"/auth/verify?token={token}")
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_verify_email_invalid_token(client):
    response = client.get("/auth/verify?token=invalidtoken")
    assert response.status_code == 400
