import { useEffect, useState } from "react"
import "./styles.css"
import {
  apiRequest,
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getApplicationNotes,
  createApplicationNote,
  updateProfile,
  changePassword,
  deactivateAccount,
  type Application,
  type ApplicationStatus,
  type ApplicationNote,
  type User,
} from "./api"
import ApplicationBoard from "./components/ApplicationBoard"

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
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [applicationNotes, setApplicationNotes] =
    useState<ApplicationNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [notesLoading, setNotesLoading] = useState(false)
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [status, setStatus] = useState<ApplicationStatus>("Applied")
  const [applicationDate, setApplicationDate] = useState("")
  const [notes, setNotes] = useState("")

  const [editingApplicationId, setEditingApplicationId] =
    useState<number | null>(null)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivatePassword, setDeactivatePassword] = useState("")

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
  }, [accessToken, statusFilter, searchQuery])

  useEffect(() => {
    if (!accessToken) {
      setApplications([])
      return
    }

    async function loadApplications() {
      setApplicationsLoading(true)
      setError("")

      try {
        const data = await getApplications(
          statusFilter === "All"
            ? undefined
            : (statusFilter as ApplicationStatus),
          searchQuery
        )
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
  }, [accessToken, statusFilter, searchQuery])
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

  function handleStartEditProfile() {
    if (!user) {
      return
    }

    setProfileName(user.name)
    setProfileEmail(user.email)
    setIsEditingProfile(true)
    setMessage("")
    setError("")
  }

  function handleCancelEditProfile() {
    setIsEditingProfile(false)
    setMessage("")
    setError("")
  }

  async function handleUpdateProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setError("")
    setLoading(true)

    try {
      const updatedUser = await updateProfile(profileName, profileEmail)

      setUser(updatedUser)
      setIsEditingProfile(false)
      setMessage("Profile updated successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleStartChangePassword() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    setIsChangingPassword(true)
    setMessage("")
    setError("")
  }

  function handleCancelChangePassword() {
    setIsChangingPassword(false)
    setMessage("")
    setError("")
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setError("")

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match")
      return
    }

    setLoading(true)

    try {
      await changePassword(currentPassword, newPassword)

      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setMessage("Password changed successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to change password"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleStartDeactivate() {
    setDeactivatePassword("")
    setIsDeactivating(true)
    setMessage("")
    setError("")
  }

  function handleCancelDeactivate() {
    setIsDeactivating(false)
    setMessage("")
    setError("")
  }

  async function handleDeactivateAccount(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? You will be logged out and will not be able to log back in."
    )

    if (!confirmed) {
      return
    }

    setMessage("")
    setError("")
    setLoading(true)

    try {
      await deactivateAccount(deactivatePassword)

      localStorage.removeItem("access_token")
      setAccessToken("")
      setUser(null)
      setApplications([])
      setIsDeactivating(false)
      setDeactivatePassword("")
      setMessage("Account deactivated successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate account"
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
  async function handleViewApplication(applicationId: number) {
    setMessage("")
    setError("")
    setNotesLoading(true)

    try {
      const [application, notes] = await Promise.all([
        getApplication(applicationId),
        getApplicationNotes(applicationId),
      ])

      setSelectedApplication(application)
      setApplicationNotes(notes)
      setNewNote("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load application details"
      )
    } finally {
      setNotesLoading(false)
    }
  }
  async function handleCreateNote(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!selectedApplication || !newNote.trim()) {
      return
    }

    setMessage("")
    setError("")
    setNoteSubmitting(true)

    try {
      const createdNote = await createApplicationNote(
        selectedApplication.id,
        newNote
      )

      setApplicationNotes((currentNotes) => [
        createdNote,
        ...currentNotes,
      ])

      setNewNote("")
      setMessage("Note added successfully")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add note"
      )
    } finally {
      setNoteSubmitting(false)
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

  async function handleBoardStatusChange(
    application: Application,
    newStatus: ApplicationStatus
  ) {
    const previousApplications = applications

    setApplications((currentApplications) =>
      currentApplications.map((current) =>
        current.id === application.id
          ? { ...current, status: newStatus }
          : current
      )
    )

    setError("")

    try {
      const updatedApplication = await updateApplication(application.id, {
        company: application.company,
        position: application.position,
        status: newStatus,
        application_date: application.application_date,
        notes: application.notes,
      })

      setApplications((currentApplications) =>
        currentApplications.map((current) =>
          current.id === updatedApplication.id
            ? updatedApplication
            : current
        )
      )
    } catch (err) {
      setApplications(previousApplications)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application status"
      )
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

        {user &&
          !isEditingProfile &&
          !isChangingPassword &&
          !isDeactivating && (
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

            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={handleGetMe}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh Profile"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={handleStartEditProfile}
              >
                Edit Profile
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={handleStartChangePassword}
              >
                Change Password
              </button>

              <button
                className="danger-button"
                type="button"
                onClick={handleStartDeactivate}
              >
                Deactivate Account
              </button>
            </div>
          </div>
        )}

        {user && isEditingProfile && (
          <div className="profile-card">
            <h3>Edit Profile</h3>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(event) =>
                    setProfileName(event.target.value)
                  }
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileEmail}
                  onChange={(event) =>
                    setProfileEmail(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancelEditProfile}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {user && isChangingPassword && (
          <div className="profile-card">
            <h3>Change Password</h3>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="current-password">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) =>
                    setConfirmNewPassword(event.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Change Password"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancelChangePassword}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {user && isDeactivating && (
          <div className="profile-card">
            <h3>Deactivate Account</h3>

            <p>
              Deactivating your account will log you out and prevent
              you from logging back in. This action requires your
              password to confirm.
            </p>

            <form onSubmit={handleDeactivateAccount}>
              <div className="form-group">
                <label htmlFor="deactivate-password">Password</label>
                <input
                  id="deactivate-password"
                  type="password"
                  value={deactivatePassword}
                  onChange={(event) =>
                    setDeactivatePassword(event.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="form-actions">
                <button
                  className="danger-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Deactivating..." : "Deactivate Account"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancelDeactivate}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
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

        {applications.length > 0 && (
          <div className="statistics-grid">
            <div className="stat-card">
              <p className="stat-card-title">Interview Rate</p>
              <p className="stat-card-value">
                {Math.round(
                  (applications.filter(
                    (application) =>
                      application.status === "Interview"
                  ).length /
                    applications.length) *
                    100
                )}
                %
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-card-title">Offer Rate</p>
              <p className="stat-card-value">
                {Math.round(
                  (applications.filter(
                    (application) => application.status === "Offer"
                  ).length /
                    applications.length) *
                    100
                )}
                %
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-card-title">Rejection Rate</p>
              <p className="stat-card-value">
                {Math.round(
                  (applications.filter(
                    (application) =>
                      application.status === "Rejected"
                  ).length /
                    applications.length) *
                    100
                )}
                %
              </p>
            </div>
          </div>
        )}

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
        {selectedApplication && (
          <section className="application-detail-card">
            <div className="application-detail-header">
              <div>
                <h3>Application Details</h3>
                <h4>{selectedApplication.company}</h4>
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setSelectedApplication(null)
                  setApplicationNotes([])
                  setNewNote("")
                }}
              >
                Close
              </button>
            </div>

            <p>
              <strong>Position:</strong>{" "}
              {selectedApplication.position}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status-badge status-${selectedApplication.status.toLowerCase()}`}
              >
                {selectedApplication.status}
              </span>
            </p>

            <p>
              <strong>Application Date:</strong>{" "}
              {selectedApplication.application_date}
            </p>

            <p>
              <strong>Created At:</strong>{" "}
              {new Date(
                selectedApplication.created_at
              ).toLocaleString()}
            </p>

            <p>
              <strong>Notes:</strong>{" "}
              {selectedApplication.notes || "No notes added."}
            </p>

            <div className="application-notes-section">
              <h4>Application Notes</h4>

              <form onSubmit={handleCreateNote}>
                <div className="form-group">
                  <label htmlFor="application-note">
                    Add a note
                  </label>

                  <textarea
                    id="application-note"
                    value={newNote}
                    onChange={(event) =>
                      setNewNote(event.target.value)
                    }
                    placeholder="Write a note about this application..."
                    maxLength={5000}
                    required
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={noteSubmitting || !newNote.trim()}
                >
                  {noteSubmitting ? "Adding..." : "Add Note"}
                </button>
              </form>

              <div className="notes-list">
                <h4>Note History</h4>

                {notesLoading ? (
                  <p>Loading notes...</p>
                ) : applicationNotes.length === 0 ? (
                  <p>No notes added yet.</p>
                ) : (
                  applicationNotes.map((note) => (
                    <div
                      className="note-card"
                      key={note.id}
                    >
                      <p>{note.content}</p>

                      <small>
                        {new Date(
                          note.created_at
                        ).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
        <section className="applications-section">
          <div className="applications-section-header">
            <h3>My Applications</h3>

            <div className="view-toggle">
              <button
                className={
                  viewMode === "list"
                    ? "primary-button"
                    : "secondary-button"
                }
                type="button"
                onClick={() => setViewMode("list")}
              >
                List
              </button>

              <button
                className={
                  viewMode === "board"
                    ? "primary-button"
                    : "secondary-button"
                }
                type="button"
                onClick={() => setViewMode("board")}
              >
                Board
              </button>
            </div>
          </div>

          <div className="filter-bar">
            <div className="form-group">
              <label htmlFor="application-search">
                Search applications
              </label>

              <input
                id="application-search"
                type="search"
                placeholder="Company or position..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="form-group">
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
          </div>

          {applicationsLoading ? (
            <div className="empty-state">
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h4>No matching applications</h4>
              <p>
                There are no applications matching the selected filters.
              </p>
            </div>
          ) : viewMode === "board" ? (
            <ApplicationBoard
              applications={applications}
              onStatusChange={handleBoardStatusChange}
            />
          ) : (
            applications.map((application) => (
              <div
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
                      handleViewApplication(application.id)
                    }
                  >
                    View Details
                  </button>
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
                      handleDeleteApplication(application.id)
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