import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import dependencies
import main
from database import Base
from routers import applications as applications_router


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[main.get_db] = override_get_db
    main.app.dependency_overrides[dependencies.get_db] = override_get_db
    main.app.dependency_overrides[applications_router.get_db] = (
        override_get_db
    )

    with TestClient(main.app) as test_client:
        yield test_client

    main.app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def register_and_login(client, email="user@example.com", password="password123", name="Test User"):
    client.post(
        "/users/register",
        json={"name": name, "email": email, "password": password},
    )

    response = client.post(
        "/users/login",
        json={"email": email, "password": password},
    )

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
