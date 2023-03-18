interface Options extends RequestInit {
  /** timeout, default: 8000ms */
  timeout?: number
}

export async function fetchWithTimeout(resource: RequestInfo | URL, options: Options = {}) {
  const { timeout } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}
