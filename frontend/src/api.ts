const API_BASE_URL = "http://127.0.0.1:8000"

export type Application = {
  id: number
  user_id: number
  company: string
  position: string
  status: string
  application_date: string
  notes: string | null
  created_at: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail || "An unexpected error occurred"
    )
  }

  return response.json()
}

export async function getApplications(): Promise<Application[]> {
  const token = localStorage.getItem("access_token")

  return apiRequest<Application[]>("/applications", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createApplication(data: {
  company: string
  position: string
  status: string
  application_date: string
  notes: string | null
}): Promise<Application> {
  const token = localStorage.getItem("access_token")

  return apiRequest<Application>("/applications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export async function updateApplication(
  applicationId: number,
  data: {
    company: string
    position: string
    status: string
    application_date: string
    notes: string | null
  }
): Promise<Application> {
  const token = localStorage.getItem("access_token")

  return apiRequest<Application>(
    `/applications/${applicationId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
}

export async function deleteApplication(
  applicationId: number
): Promise<{ message: string }> {
  const token = localStorage.getItem("access_token")

  return apiRequest<{ message: string }>(
    `/applications/${applicationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}