from tests.conftest import register_and_login


def test_register_success(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "jane@example.com"
    assert "password" not in body["user"]
    assert "password_hash" not in body["user"]


def test_register_duplicate_email(client):
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "password123",
    }

    client.post("/users/register", json=payload)
    response = client.post("/users/register", json=payload)

    assert response.status_code == 400


def test_register_short_password_rejected(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "short",
        },
    )

    assert response.status_code == 422


def test_login_success(client):
    register_and_login(client)


def test_login_wrong_password(client):
    client.post(
        "/users/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/users/login",
        json={"email": "jane@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401


def test_login_nonexistent_email(client):
    response = client.post(
        "/users/login",
        json={"email": "ghost@example.com", "password": "password123"},
    )

    assert response.status_code == 401


def test_get_me_requires_auth(client):
    response = client.get("/users/me")

    assert response.status_code == 401


def test_get_me_success(client):
    headers = register_and_login(client)

    response = client.get("/users/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"


def test_get_me_invalid_token(client):
    response = client.get(
        "/users/me",
        headers={"Authorization": "Bearer not-a-real-token"},
    )

    assert response.status_code == 401
