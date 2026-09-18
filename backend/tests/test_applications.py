from tests.conftest import register_and_login


def create_application(client, headers, company="Acme", position="Engineer", status="Applied"):
    response = client.post(
        "/applications",
        json={
            "company": company,
            "position": position,
            "status": status,
            "application_date": "2026-01-15",
            "notes": None,
        },
        headers=headers,
    )

    return response


def test_create_application_requires_auth(client):
    response = client.post(
        "/applications",
        json={
            "company": "Acme",
            "position": "Engineer",
            "status": "Applied",
            "application_date": "2026-01-15",
            "notes": None,
        },
    )

    assert response.status_code == 401


def test_create_and_list_application(client):
    headers = register_and_login(client)

    create_response = create_application(client, headers)
    assert create_response.status_code == 200
    assert create_response.json()["company"] == "Acme"

    list_response = client.get("/applications", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


def test_get_application_not_found(client):
    headers = register_and_login(client)

    response = client.get("/applications/999", headers=headers)

    assert response.status_code == 404


def test_ownership_isolation(client):
    headers_a = register_and_login(
        client, email="a@example.com", name="User A"
    )
    headers_b = register_and_login(
        client, email="b@example.com", name="User B"
    )

    created = create_application(client, headers_a).json()
    app_id = created["id"]

    # User B cannot see, update, or delete User A's application.
    get_response = client.get(f"/applications/{app_id}", headers=headers_b)
    assert get_response.status_code == 404

    update_response = client.put(
        f"/applications/{app_id}",
        json={
            "company": "Hacked",
            "position": "Hacked",
            "status": "Applied",
            "application_date": "2026-01-15",
            "notes": None,
        },
        headers=headers_b,
    )
    assert update_response.status_code == 404

    delete_response = client.delete(
        f"/applications/{app_id}", headers=headers_b
    )
    assert delete_response.status_code == 404

    # User A's application is untouched and still visible to User A.
    list_response = client.get("/applications", headers=headers_a)
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["company"] == "Acme"


def test_update_application(client):
    headers = register_and_login(client)
    created = create_application(client, headers).json()

    response = client.put(
        f"/applications/{created['id']}",
        json={
            "company": "Updated Co",
            "position": "Senior Engineer",
            "status": "Interview",
            "application_date": "2026-02-01",
            "notes": "Great call",
        },
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["company"] == "Updated Co"
    assert response.json()["status"] == "Interview"


def test_delete_application(client):
    headers = register_and_login(client)
    created = create_application(client, headers).json()

    delete_response = client.delete(
        f"/applications/{created['id']}", headers=headers
    )
    assert delete_response.status_code == 200

    get_response = client.get(
        f"/applications/{created['id']}", headers=headers
    )
    assert get_response.status_code == 404


def test_filter_by_status(client):
    headers = register_and_login(client)
    create_application(client, headers, company="A", status="Applied")
    create_application(client, headers, company="B", status="Offer")

    response = client.get("/applications?status=Offer", headers=headers)

    assert response.status_code == 200
    companies = [a["company"] for a in response.json()]
    assert companies == ["B"]


def test_search_by_company(client):
    headers = register_and_login(client)
    create_application(client, headers, company="Globex Corp")
    create_application(client, headers, company="Initech")

    response = client.get("/applications?search=globex", headers=headers)

    assert response.status_code == 200
    companies = [a["company"] for a in response.json()]
    assert companies == ["Globex Corp"]


def test_pagination_limit(client):
    headers = register_and_login(client)
    for i in range(3):
        create_application(client, headers, company=f"Company{i}")

    response = client.get("/applications?limit=2", headers=headers)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_create_application_missing_required_field(client):
    headers = register_and_login(client)

    response = client.post(
        "/applications",
        json={"company": "Acme"},
        headers=headers,
    )

    assert response.status_code == 422


def test_notes_lifecycle(client):
    headers = register_and_login(client)
    created = create_application(client, headers).json()

    add_response = client.post(
        f"/applications/{created['id']}/notes",
        json={"content": "Recruiter call scheduled"},
        headers=headers,
    )
    assert add_response.status_code == 200

    list_response = client.get(
        f"/applications/{created['id']}/notes", headers=headers
    )
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["content"] == "Recruiter call scheduled"


def test_notes_require_ownership(client):
    headers_a = register_and_login(
        client, email="a@example.com", name="User A"
    )
    headers_b = register_and_login(
        client, email="b@example.com", name="User B"
    )
    created = create_application(client, headers_a).json()

    response = client.get(
        f"/applications/{created['id']}/notes", headers=headers_b
    )

    assert response.status_code == 404
