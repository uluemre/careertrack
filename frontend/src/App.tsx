import { useEffect, useState } from "react"
import {
  apiRequest,
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  type Application,
  type ApplicationStatus,
} from "./api"
import "./styles.css"

type User = {
  id: number
  name: string
  email: string
  is_active: boolean
}

function App() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const handleUnauthorized = () => {
    localStorage.removeItem("access_token")
    setAccessToken("")
    setUser(null)
  }
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token") || ""
  )

  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [statusFilter, setStatusFilter] = useState("All")

  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [status, setStatus] = useState<ApplicationStatus>("Applied")
  const [applicationDate, setApplicationDate] = useState("")
  const [notes, setNotes] = useState("")

  const [editingApplicationId, setEditingApplicationId] =
    useState<number | null>(null)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [applicationsLoading, setApplicationsLoading] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      return
    }

    async function loadUser() {
      try {
        const data = await apiRequest<User>("/users/me", {
          method: "GET",
        })

        setUser(data)
      } catch (err) {
        const error = err as Error & { status?: number }

        if (error.status === 401) {
          handleUnauthorized()
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to get user information"
        )
      }
    }

    loadUser()
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) {
      setApplications([])
      return
    }

    async function loadApplications() {
      setApplicationsLoading(true)
      setError("")

      try {
        const data = await getApplications()
        setApplications(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load applications"
        )
      } finally {
        setApplicationsLoading(false)
      }
    }

    loadApplications()
  }, [accessToken])

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const data = await apiRequest<{
        message: string
      }>("/users/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      setMessage(data.message)

      setName("")
      setEmail("")
      setPassword("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const data = await apiRequest<{
        access_token: string
        token_type: string
      }>("/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      setAccessToken(data.access_token)

      localStorage.setItem(
        "access_token",
        data.access_token
      )

      setMessage("Login successful")

      setLoginEmail("")
      setLoginPassword("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGetMe() {
    setMessage("")
    setError("")
    setLoading(true)

    try {
      const data = await apiRequest<User>("/users/me", {
        method: "GET",
      })

      setUser(data)
    } catch (err) {
      const error = err as Error & { status?: number }

      if (error.status === 401) {
        handleUnauthorized()
        return
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to get user information"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateApplication(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const newApplication = await createApplication({
        company,
        position,
        status,
        application_date: applicationDate,
        notes: notes || null,
      })

      setApplications((currentApplications) => [
        ...currentApplications,
        newApplication,
      ])

      setCompany("")
      setPosition("")
      setStatus("Applied")
      setApplicationDate("")
      setNotes("")

      setMessage("Application created successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create application"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleEditApplication(application: Application) {
    setEditingApplicationId(application.id)
    setCompany(application.company)
    setPosition(application.position)
    setStatus(application.status)
    setApplicationDate(application.application_date)
    setNotes(application.notes || "")
    setMessage("")
    setError("")
  }

  function handleCancelEdit() {
    setEditingApplicationId(null)
    setCompany("")
    setPosition("")
    setStatus("Applied")
    setApplicationDate("")
    setNotes("")
    setMessage("")
    setError("")
  }

  async function handleUpdateApplication(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (editingApplicationId === null) {
      return
    }

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const updatedApplication = await updateApplication(
        editingApplicationId,
        {
          company,
          position,
          status,
          application_date: applicationDate,
          notes: notes || null,
        }
      )

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === updatedApplication.id
            ? updatedApplication
            : application
        )
      )

      setEditingApplicationId(null)
      setCompany("")
      setPosition("")
      setStatus("Applied")
      setApplicationDate("")
      setNotes("")

      setMessage("Application updated successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteApplication(applicationId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    )

    if (!confirmed) {
      return
    }

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const data = await deleteApplication(applicationId)

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application.id !== applicationId
        )
      )

      if (editingApplicationId === applicationId) {
        handleCancelEdit()
      }

      setMessage(data.message)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete application"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token")
    setAccessToken("")
    setUser(null)
    setApplications([])
    setMessage("Logged out successfully")
    setError("")
  }

  if (!accessToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>CareerTrack</h1>
          <p>Job & Internship Application Tracker</p>

          <h2>Create Account</h2>

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={8}
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <hr />

          <h2>Login</h2>

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                required
                minLength={8}
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="message">{message}</p>
          )}

          {error && (
            <p className="error">{error}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>CareerTrack</h1>
          <p>Job & Internship Application Tracker</p>
        </div>

        <div className="header-actions">
          {user && <span>Welcome, {user.name}</span>}

          <button
            className="secondary-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        {message && (
          <p className="message">{message}</p>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        {user && (
          <div className="profile-card">
            <h3>Profile</h3>

            <p>
              <strong>Name:</strong> {user.name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {user.is_active ? "Active" : "Inactive"}
            </p>

            <button
              className="secondary-button"
              onClick={handleGetMe}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Profile"}
            </button>
          </div>
        )}

        <h3>Application Statistics</h3>

        <div className="statistics-grid">
          <div className="stat-card">
            <p className="stat-card-title">Total</p>
            <p className="stat-card-value">
              {applications.length}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-card-title">Applied</p>
            <p className="stat-card-value">
              {
                applications.filter(
                  (application) =>
                    application.status === "Applied"
                ).length
              }
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-card-title">Interview</p>
            <p className="stat-card-value">
              {
                applications.filter(
                  (application) =>
                    application.status === "Interview"
                ).length
              }
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-card-title">Offer</p>
            <p className="stat-card-value">
              {
                applications.filter(
                  (application) =>
                    application.status === "Offer"
                ).length
              }
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-card-title">Rejected</p>
            <p className="stat-card-value">
              {
                applications.filter(
                  (application) =>
                    application.status === "Rejected"
                ).length
              }
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-card-title">Withdrawn</p>
            <p className="stat-card-value">
              {
                applications.filter(
                  (application) =>
                    application.status === "Withdrawn"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="form-card">
          <h3>
            {editingApplicationId === null
              ? "Add Application"
              : "Edit Application"}
          </h3>

          <form
            onSubmit={
              editingApplicationId === null
                ? handleCreateApplication
                : handleUpdateApplication
            }
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="company">
                  Company
                </label>

                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">
                  Position
                </label>

                <input
                  id="position"
                  type="text"
                  value={position}
                  onChange={(event) =>
                    setPosition(event.target.value)
                  }
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ApplicationStatus)
                  }
                >
                  <option value="Applied">
                    Applied
                  </option>
                  <option value="Interview">
                    Interview
                  </option>
                  <option value="Offer">
                    Offer
                  </option>
                  <option value="Rejected">
                    Rejected
                  </option>
                  <option value="Withdrawn">
                    Withdrawn
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="application-date">
                  Application Date
                </label>

                <input
                  id="application-date"
                  type="date"
                  value={applicationDate}
                  onChange={(event) =>
                    setApplicationDate(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {editingApplicationId === null
                  ? loading
                    ? "Creating..."
                    : "Add Application"
                  : loading
                    ? "Updating..."
                    : "Update Application"}
              </button>

              {editingApplicationId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <section className="applications-section">
          <h3>My Applications</h3>
          <div className="filter-bar">
            <label htmlFor="status-filter">
              Filter by status:
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
          {applicationsLoading ? (
            <div className="empty-state">
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h4>No applications yet</h4>
              <p>
                Add your first job or internship application above.
              </p>
            </div>
          ) : applications.filter(
            (application) =>
              statusFilter === "All" ||
              application.status === statusFilter
          ).length === 0 ? (
            <div className="empty-state">
              <h4>No matching applications</h4>
              <p>
                There are no applications with the selected status.
              </p>
            </div>
          ) : (
            applications
              .filter(
                (application) =>
                  statusFilter === "All" ||
                  application.status === statusFilter
              )
              .map((application) => (<div
                className="application-card"
                key={application.id}
              >
                <h4>{application.company}</h4>

                <p>
                  <strong>Position:</strong>{" "}
                  {application.position}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge status-${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </span>
                </p>

                <p>
                  <strong>Application Date:</strong>{" "}
                  {application.application_date}
                </p>

                {application.notes && (
                  <p>
                    <strong>Notes:</strong>{" "}
                    {application.notes}
                  </p>
                )}

                <div className="application-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      handleEditApplication(application)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    type="button"
                    onClick={() =>
                      handleDeleteApplication(
                        application.id
                      )
                    }
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
              ))
          )}
        </section>
      </main>
    </div>
  )
}

export default App