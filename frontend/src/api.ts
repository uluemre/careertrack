const API_BASE_URL = "http://127.0.0.1:8000"

export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"

export type Application = {
  id: number
  user_id: number
  company: string
  position: string
  status: ApplicationStatus
  application_date: string
  notes: string | null
  created_at: string
}

type ApplicationPayload = {
  company: string
  position: string
  status: ApplicationStatus
  application_date: string
  notes: string | null
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token")

  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {}
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    const error = new Error(
      errorData?.detail || `Request failed with status ${response.status}`
    )

      ; (error as Error & { status?: number }).status = response.status

    throw error
  }

  return response.json()
}

export async function getApplications(): Promise<Application[]> {
  return apiRequest<Application[]>("/applications", {
    method: "GET",
  })
}

export async function createApplication(
  data: ApplicationPayload
): Promise<Application> {
  return apiRequest<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateApplication(
  applicationId: number,
  data: ApplicationPayload
): Promise<Application> {
  return apiRequest<Application>(
    `/applications/${applicationId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

export async function deleteApplication(
  applicationId: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/applications/${applicationId}`,
    {
      method: "DELETE",
    }
  )
}