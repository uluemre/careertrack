import { useEffect, useState } from "react"
import { apiRequest } from "./api"

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

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token") || ""
  )

  const [user, setUser] = useState<User | null>(null)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!accessToken) {
      return
    }

    async function loadUser() {
      try {
        const data = await apiRequest<User>("/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        setUser(data)
      } catch {
        localStorage.removeItem("access_token")
        setAccessToken("")
      }
    }

    loadUser()
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setUser(data)
      setMessage("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get user information"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token")
    setAccessToken("")
    setUser(null)
    setMessage("Logged out successfully")
    setError("")
  }

  return (
    <div>
      <h1>CareerTrack</h1>
      <p>Job & Internship Application Tracker</p>

      {!accessToken ? (
        <>
          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <div>
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

            <div>
              <label htmlFor="login-password">Password</label>
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

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2>Dashboard</h2>

          <button onClick={handleGetMe} disabled={loading}>
            {loading ? "Loading..." : "Get My Profile"}
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

          {user && (
            <div>
              <h3>Profile</h3>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>
                Status: {user.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          )}
        </>
      )}

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  )
}

export default App