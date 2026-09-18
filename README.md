# CareerTrack

A full-stack job and internship application tracking system. CareerTrack
helps you keep every application, its current stage, and your notes about
it in one place instead of scattered across spreadsheets and email
threads.

## Features

- Secure account registration and login (JWT-based authentication)
- Profile management: update name/email, change password, deactivate
  account
- Track applications with company, position, status, application date,
  and notes
- Timestamped notes per application (recruiter info, interview prep,
  follow-ups)
- Search applications by company or position, filter by status
- Two ways to view your pipeline: a filterable list, or a drag-and-drop
  Kanban board by status
- At-a-glance statistics: counts per status plus interview/offer/rejection
  rates
- Every application and note is scoped to its owner — users can only ever
  see or modify their own data

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, JWT
(python-jose), bcrypt

**Frontend:** React, TypeScript, Vite

**Testing:** pytest + FastAPI's TestClient (backend), running against an
isolated in-memory SQLite database

## Architecture

```
careertrack/
  backend/
    main.py            - app setup, auth endpoints, profile endpoints
    database.py         - SQLAlchemy engine/session config
    models.py           - User, Application, ApplicationNote
    schemas.py           - Pydantic request/response models
    auth.py              - password hashing, JWT creation/validation
    dependencies.py      - get_current_user auth dependency
    routers/
      applications.py    - application + notes CRUD
    tests/                - pytest suite (auth, applications, profile)

  frontend/
    src/
      App.tsx             - main application shell and views
      api.ts               - typed API client
      components/
        ApplicationBoard.tsx - Kanban board view
      styles.css
```

Applications and their notes are modeled as first-class resources owned
by a user; every read/write is filtered by the authenticated user's ID at
the database query level, so ownership can't be bypassed by guessing IDs.

## Setup

### Backend

1. Create and activate a Python virtual environment inside `backend/`.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `backend/.env` file with:
   ```
   DATABASE_USER=...
   DATABASE_PASSWORD=...
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=careertrack
   JWT_SECRET_KEY=...
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   # Optional, comma-separated. Defaults to http://localhost:5173
   ALLOWED_ORIGINS=http://localhost:5173
   ```
4. Run the API:
   ```
   uvicorn main:app --reload --port 8000
   ```

### Frontend

1. Install dependencies:
   ```
   npm install
   ```
2. (Optional) create a `.env` file to point at a non-default API URL:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
3. Run the dev server:
   ```
   npm run dev
   ```

### Tests

```
cd backend
pytest
```

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/users/register` | Create an account |
| POST | `/users/login` | Authenticate, returns a JWT |
| GET | `/users/me` | Current user profile |
| PUT | `/users/me` | Update name/email |
| PUT | `/users/me/password` | Change password |
| PUT | `/users/me/deactivate` | Deactivate account |
| GET/POST | `/applications` | List (filter/search/paginate) or create applications |
| GET/PUT/DELETE | `/applications/{id}` | Read, update, or delete one application |
| GET/POST | `/applications/{id}/notes` | List or add notes on an application |

All `/applications` and `/users/me*` endpoints require a `Bearer` token
from `/users/login`.
