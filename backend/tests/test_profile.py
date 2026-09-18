from tests.conftest import register_and_login


def test_update_profile(client):
    headers = register_and_login(client)

    response = client.put(
        "/users/me",
        json={"name": "New Name", "email": "user@example.com"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "New Name"

    me_response = client.get("/users/me", headers=headers)
    assert me_response.json()["name"] == "New Name"


def test_update_profile_duplicate_email(client):
    register_and_login(
        client, email="taken@example.com", name="Other User"
    )
    headers = register_and_login(
        client, email="user@example.com", name="Test User"
    )

    response = client.put(
        "/users/me",
        json={"name": "Test User", "email": "taken@example.com"},
        headers=headers,
    )

    assert response.status_code == 400


def test_change_password_wrong_current(client):
    headers = register_and_login(client)

    response = client.put(
        "/users/me/password",
        json={
            "current_password": "wrongpassword",
            "new_password": "newpassword456",
        },
        headers=headers,
    )

    assert response.status_code == 401


def test_change_password_success_then_login(client):
    headers = register_and_login(client)

    response = client.put(
        "/users/me/password",
        json={
            "current_password": "password123",
            "new_password": "newpassword456",
        },
        headers=headers,
    )
    assert response.status_code == 200

    old_login = client.post(
        "/users/login",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/users/login",
        json={"email": "user@example.com", "password": "newpassword456"},
    )
    assert new_login.status_code == 200


def test_deactivate_account_wrong_password(client):
    headers = register_and_login(client)

    response = client.put(
        "/users/me/deactivate",
        json={"password": "wrongpassword"},
        headers=headers,
    )

    assert response.status_code == 401

    me_response = client.get("/users/me", headers=headers)
    assert me_response.status_code == 200


def test_deactivate_account_then_access_blocked(client):
    headers = register_and_login(client)

    response = client.put(
        "/users/me/deactivate",
        json={"password": "password123"},
        headers=headers,
    )
    assert response.status_code == 200

    me_response = client.get("/users/me", headers=headers)
    assert me_response.status_code == 403

    login_response = client.post(
        "/users/login",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert login_response.status_code == 403
