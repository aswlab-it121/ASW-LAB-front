import { apiUrl } from './config'
import { ApiError } from './types'
import { getSelectedApiKey } from '../../app/store/userStore'

type RequestInitLike = Omit<RequestInit, 'body' | 'headers'> & {
  json?: any
  form?: FormData
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const json = await res.json()
    return { message: json.message || res.statusText, code: res.status, details: json }
  } catch (e) {
    return { message: res.statusText, code: res.status }
  }
}

export async function request<T>(path: string, options: RequestInitLike = {}): Promise<T> {
  const url = apiUrl(path)
  const headers: Record<string, string> = {}
  const apiKey = getSelectedApiKey()
  if (apiKey) headers['X-API-KEY'] = apiKey

  let body: BodyInit | undefined
  if (options.form) {
    body = options.form
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.json)
  }

  const res = await fetch(url, { ...options, headers, body })
  if (!res.ok) {
    const err = await parseError(res)
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  // For downloads or empty responses
  // @ts-ignore
  return (await res.text()) as T
}

export const api = {
  get: <T>(path: string, opts?: RequestInit) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, json?: any) => request<T>(path, { method: 'POST', json }),
  put: <T>(path: string, json?: any) => request<T>(path, { method: 'PUT', json }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  formPost: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form })
}
