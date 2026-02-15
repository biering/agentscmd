const DEFAULT_BASE_URL = 'https://api.agentscmd.com'

export function getApiKey(): string | undefined {
  return process.env.AGENTSCMD_API_KEY
}

export function getBaseUrl(): string {
  return process.env.AGENTSCMD_API_URL ?? DEFAULT_BASE_URL
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { searchParams?: Record<string, string> } = {},
): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new ApiError(
      'AGENTSCMD_API_KEY is not set. Set it to your agent API key from agentscmd.com.',
      401,
    )
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl)
  if (options.searchParams) {
    for (const [k, v] of Object.entries(options.searchParams)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    }
  }

  const { searchParams: _, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers)
  headers.set('x-api-key', apiKey)
  headers.set('Accept', 'application/json')
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
  })

  let body: unknown
  const ct = res.headers.get('Content-Type')
  if (ct?.includes('application/json')) {
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
  } else {
    body = await res.text()
  }

  if (!res.ok) {
    const msg =
      typeof body === 'object' && body !== null && 'message' in (body as object)
        ? String((body as { message: unknown }).message)
        : res.statusText || `HTTP ${res.status}`
    throw new ApiError(msg, res.status, body)
  }

  return body as T
}
