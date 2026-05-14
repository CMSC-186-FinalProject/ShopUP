export class ApiError extends Error {
  payload: unknown
  status?: number

  constructor(message: string, payload?: unknown, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.payload = payload
    this.status = status
  }
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error?: unknown }).error ?? 'Request failed')
      : 'Request failed'

    // Throw a structured ApiError so callers can inspect the original payload.
    throw new ApiError(message, payload, response.status)
  }

  return payload as T
}
