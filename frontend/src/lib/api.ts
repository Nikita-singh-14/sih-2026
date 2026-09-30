const apiBase = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('measuresure-token')
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  const result = await response.json().catch(() => ({})) as { message?: string }
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`)
  return result as T
}