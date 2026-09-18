# CareerTrack — Master Development Roadmap

## 1. Project Vision

CareerTrack is a full-stack job and internship application tracking platform.

The goal is to provide users with a centralized system where they can:

- create an account
- authenticate securely
- manage their profile
- track companies and job opportunities
- create and manage job applications
- update application statuses
- store application notes
- search and filter applications
- visualize their application pipeline
- monitor application statistics
- eventually prepare the application for production deployment

The project should evolve into a realistic portfolio-quality SaaS-style application rather than remaining a basic CRUD demonstration.

---

# 2. Development Philosophy

The project should be developed incrementally.

Every phase should produce a usable improvement to the application.

Development priorities:

1. Correctness
2. Security
3. Maintainability
4. Good API design
5. Good database structure
6. Good frontend architecture
7. User experience
8. Testing
9. Production readiness

Do not implement features merely because they appear on this roadmap.

Before starting work:

- inspect the repository
- inspect the current backend
- inspect the current frontend
- inspect database models
- inspect API routes
- inspect authentication
- inspect Git history when useful
- inspect the current UI
- identify what already exists
- identify what is partially implemented
- identify technical debt
- determine the correct next step

Never assume that a feature is missing simply because it appears in this roadmap.

Never assume that a feature is complete simply because it appears implemented.

The repository is the source of truth.

---

# 3. Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT authentication
- bcrypt password hashing

## Frontend

- React
- TypeScript
- Vite
- CSS

## Development

- Git
- GitHub
- PostgreSQL / pgAdmin
- Python virtual environment

The architecture should remain simple enough for a solo developer to maintain while following professional software development practices.

---

# 4. Target Architecture

The application should eventually follow a structure similar to:

careertrack/

    backend/
        main.py
        database.py
        models.py
        schemas.py
        auth.py
        dependencies.py
        routers/

    frontend/
        src/
            components/
            pages/
            services/
            hooks/
            types/
            App.tsx
            api.ts
            styles.css

    database/

    Roadmap.md

The exact structure may evolve.

Do not refactor the entire application unnecessarily.

Prefer incremental architectural improvements.

---

# 5. Phase A — Foundation

Establish the basic full-stack application.

Backend responsibilities:

- FastAPI application
- PostgreSQL connection
- SQLAlchemy setup
- environment configuration
- database session management
- base model configuration
- health endpoint
- basic API structure

Frontend responsibilities:

- React + TypeScript application
- Vite configuration
- basic application shell
- API communication foundation
- basic styling

Development responsibilities:

- Git repository
- `.gitignore`
- README
- environment variable handling
- clean project structure

Definition of Done:

The application can run locally and communicate with PostgreSQL.

---

# 6. Phase B — Authentication

Build a secure authentication system.

## Registration

Implement:

- user registration
- name validation
- email validation
- password validation
- duplicate email prevention
- password hashing
- user creation
- safe response objects

Passwords must never be stored as plaintext.

Passwords must never be returned by API responses.

## Login

Implement:

- email/password authentication
- credential validation
- JWT generation
- token expiration
- appropriate error responses

## JWT

Implement:

- JWT secret configuration
- algorithm configuration
- token expiration configuration
- access token creation
- token decoding
- token validation

Secrets must come from environment variables.

Never hard-code secrets.

## Authentication dependency

Implement a reusable dependency capable of:

- reading Bearer tokens
- validating JWT
- extracting user identity
- loading the current user
- rejecting invalid tokens
- rejecting inactive users

## Current user

Provide an endpoint such as:

GET /users/me

The endpoint should return safe user information.

---

# 7. Phase C — User & Profile Management

Once authentication is stable, expand user functionality.

Possible functionality:

- view profile
- update name
- update email
- change password
- deactivate account

Security requirements:

- authenticated access
- current-user ownership
- password verification when required
- validation
- safe error handling

Do not expose sensitive fields.

---

# 8. Phase D — Job Management

Introduce the job/opportunity domain.

A Job should represent an opportunity that a user is interested in.

Potential fields:

- id
- user_id
- company
- position
- location
- job_type
- work_mode
- salary information
- job_url
- description
- source
- created_at
- updated_at

Fields should be adjusted based on the actual application requirements.

## CRUD

Implement:

- create job
- list jobs
- get job
- update job
- delete job

## Authorization

Users must only be able to access their own jobs.

A user must never be able to retrieve, update or delete another user's records simply by changing an ID.

## Validation

Implement:

- required fields
- string length validation
- URL validation where appropriate
- sensible enum values
- database constraints

---

# 9. Phase E — Application Tracking

Introduce the central CareerTrack functionality.

An Application represents a user's application to a job.

Potential fields:

- id
- user_id
- job_id
- status
- applied_at
- deadline
- notes
- interview_date
- created_at
- updated_at

Application statuses should represent a realistic hiring pipeline.

Example:

- Wishlist
- Applied
- Screening
- Interview
- Offer
- Rejected
- Withdrawn

The exact statuses should follow the implementation already established in the repository.

## Application CRUD

Implement:

- create application
- list applications
- retrieve application
- update application
- delete application

## Status management

Users should be able to update application status.

Status transitions should be represented clearly in the API and frontend.

## Notes

Applications should support useful notes.

Examples:

- recruiter information
- interview preparation
- follow-up reminders
- personal observations

Notes should remain associated with the correct application and protected by ownership.

---

# 10. Phase F — Search & Filtering

Applications should become easy to manage when the user has many records.

Implement backend filtering where appropriate.

Possible filters:

- status
- company
- position
- location
- date
- job type
- work mode

Implement search for:

- company
- position
- relevant text fields

Support combinations of filters where practical.

Avoid loading unnecessary records from the database.

Database queries should remain efficient.

---

# 11. Phase G — Frontend Authentication

Build the complete frontend authentication experience.

Pages/components may include:

- Login
- Register
- protected application shell
- logout
- authentication loading state
- authentication errors

The frontend should communicate with the backend API cleanly.

Implement an authentication state strategy.

Possible responsibilities:

- storing access token
- attaching Authorization header
- detecting expired authentication
- redirecting unauthenticated users
- clearing authentication state on logout

Do not expose secrets in frontend source code.

---

# 12. Phase H — Application Dashboard

Create the primary CareerTrack experience.

The dashboard should allow users to understand their job search quickly.

Potential sections:

- total applications
- active applications
- interviews
- offers
- rejected applications
- recent applications
- upcoming interviews
- upcoming deadlines

The dashboard should consume real backend data.

Avoid hard-coded statistics.

---

# 13. Phase I — Application Board

Create a visual application pipeline.

Possible columns:

Wishlist

Applied

Screening

Interview

Offer

Rejected

Withdrawn

Users should be able to quickly understand where each application is in the hiring process.

If drag-and-drop is introduced, ensure that:

- status updates are persisted
- failed updates are handled
- UI state does not silently diverge from backend state
- ownership rules remain enforced

---

# 14. Phase J — Application Details

Create a dedicated application details experience.

Display:

- company
- position
- status
- application date
- deadline
- interview date
- job URL
- notes
- relevant job information
- timestamps

Allow users to:

- edit
- change status
- add/update notes
- delete application

The page should remain usable on smaller screens.

---

# 15. Phase K — Statistics & Analytics

Introduce meaningful job-search analytics.

Potential metrics:

- total applications
- applications by status
- applications over time
- interview conversion rate
- offer rate
- rejection rate
- active applications
- average time between application stages

Charts should only be introduced when the underlying data is reliable.

Do not create misleading statistics.

---

# 16. Phase L — UX Improvements

Improve the product experience.

Implement:

- loading states
- empty states
- form validation messages
- API error messages
- success feedback
- confirmation dialogs
- disabled states during requests
- responsive layouts
- navigation
- consistent buttons
- consistent forms
- consistent cards
- consistent spacing

Avoid unnecessary visual complexity.

The application should look like a real portfolio project.

---

# 17. Phase M — Backend Quality

Improve backend maintainability.

Potential improvements:

- router separation
- dependency separation
- schema separation
- service layer where justified
- reusable authentication dependencies
- centralized error handling
- response models
- consistent HTTP status codes
- pagination
- query optimization

Do not introduce abstractions purely for the sake of abstraction.

---

# 18. Phase N — Security

Perform a dedicated security pass.

Check:

- password hashing
- JWT validation
- token expiration
- secret management
- authorization
- user ownership
- SQL injection protection
- input validation
- sensitive response fields
- CORS configuration
- error message leakage
- environment variable handling

Important principle:

Authentication answers:

"Who are you?"

Authorization answers:

"Are you allowed to access this resource?"

Both must be implemented correctly.

---

# 19. Phase O — Testing

Introduce automated testing progressively.

## Backend

Test:

- registration
- duplicate registration
- login
- invalid credentials
- JWT validation
- protected endpoints
- current-user endpoint
- job CRUD
- application CRUD
- ownership restrictions
- filtering
- validation failures

## Frontend

Test critical flows where practical:

- registration
- login
- logout
- protected navigation
- application creation
- status updates
- filtering

Prioritize business-critical behavior over superficial coverage.

---

# 20. Phase P — Production Preparation

Prepare CareerTrack for deployment.

Review:

- environment variables
- production database configuration
- CORS
- frontend API URL
- backend startup configuration
- build process
- error handling
- logging
- database migrations
- security configuration

The application should not depend on local development assumptions.

---

# 21. Phase Q — Deployment

Select an appropriate deployment strategy.

Possible architecture:

Frontend
→ static hosting

Backend
→ application hosting

Database
→ managed PostgreSQL

The exact providers can be selected later based on cost, simplicity and portfolio value.

Deployment should include:

- production environment variables
- database setup
- backend deployment
- frontend deployment
- API URL configuration
- smoke testing
- authentication testing
- CRUD testing

---

# 22. Phase R — Portfolio Quality

Once the product is technically stable, improve its presentation.

README should explain:

- what CareerTrack is
- why it exists
- main features
- technology stack
- architecture
- setup instructions
- screenshots
- API information
- deployment information

The GitHub repository should demonstrate:

- meaningful commits
- organized code
- understandable structure
- documentation
- clean configuration

---

# 23. Development Rules

When working on CareerTrack:

### Rule 1

Always inspect the existing implementation before changing it.

### Rule 2

Do not recreate existing functionality.

### Rule 3

Do not assume the roadmap reflects the current repository state.

### Rule 4

The repository is the source of truth.

### Rule 5

Do not ask the developer to paste every source file.

Read the repository and inspect the relevant files yourself whenever possible.

### Rule 6

Do not make unrelated changes while implementing a feature.

### Rule 7

Prefer small, understandable commits.

### Rule 8

Run appropriate tests after meaningful changes.

### Rule 9

Do not expose secrets.

### Rule 10

Do not silently change architecture.

If a significant architectural change is necessary, explain why before implementing it.

---

# 24. Claude Development Protocol

At the beginning of a new development session:

1. Inspect the repository.
2. Read `Roadmap.md`.
3. Inspect Git history.
4. Inspect the current backend.
5. Inspect the current frontend.
6. Identify the current implementation state.
7. Determine the highest-priority unfinished roadmap item.
8. Explain the next development target briefly.
9. Implement incrementally.
10. Test the change.
11. Check Git diff.
12. Suggest an appropriate commit message.

Do not ask the developer to manually provide files that can be inspected from the repository.

Do not repeat information that can be determined from the repository.

---

# 25. Definition of Done

A feature is considered complete only when:

- implementation exists
- backend/frontend integration works where applicable
- validation exists
- authorization is correct
- errors are handled
- relevant tests pass
- no obvious regression exists
- code is reasonably maintainable
- Git diff has been reviewed

A feature should not be considered complete merely because the code compiles.

---

# 26. Long-Term Product Direction

CareerTrack should gradually evolve from:

simple CRUD application

into:

authenticated full-stack application

then:

job application management platform

then:

analytics/dashboard product

and eventually:

production-ready portfolio SaaS application.

Future possibilities may include:

- reminders
- email notifications
- calendar integration
- resume management
- interview preparation
- AI-assisted application analysis
- job import
- browser extension
- application deadline tracking
- personalized job-search analytics

These are future possibilities, not requirements for the core MVP.

Do not implement them before the core application is stable.

---

# 27. Final Principle

The roadmap describes the destination.

The repository describes the current reality.

Always inspect the repository first and determine where the project currently stands.

Then choose the smallest sensible next step toward the target architecture.

Do not blindly execute the roadmap from the beginning.

Do not undo existing work merely to match the roadmap.

Do not assume that previous work was performed by an assistant.

Treat the existing codebase as the work of an active solo developer and build upon it carefully.