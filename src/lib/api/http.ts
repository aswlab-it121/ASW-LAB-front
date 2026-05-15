import { apiUrl } from './config'
import { ApiError } from './types'
import { getSelectedApiKey } from '../../app/store/userStore'

type RequestInitLike = Omit<RequestInit, 'body' | 'headers'> & {
  json?: any
  form?: FormData
  params?: Record<string, string | number | boolean | null | undefined>
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const json = await res.json()
    return { message: json.error || json.message || res.statusText, code: res.status, details: json }
  } catch (e) {
    return { message: res.statusText, code: res.status }
  }
}

function appendParams(url: string, params?: RequestInitLike['params']) {
  if (!params) return url
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  if (!query) return url
  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}

export async function request<T>(path: string, options: RequestInitLike = {}): Promise<T> {
  const url = appendParams(apiUrl(path), options.params)
  const headers: Record<string, string> = {}
  const apiKey = getSelectedApiKey()
  if (apiKey) headers['X-Api-Key'] = apiKey

  let body: BodyInit | undefined
  if (options.form) {
    body = options.form
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.json)
  }

  const { json, form, params, ...fetchOptions } = options
  const res = await fetch(url, { ...fetchOptions, headers, body })
  if (!res.ok) {
    const err = await parseError(res)
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  const text = await res.text()
  return text as T
}

export const api = {
  get: <T>(path: string, params?: RequestInitLike['params'], opts?: RequestInit) =>
    request<T>(path, { ...opts, method: 'GET', params }),
  post: <T>(path: string, json?: any) => request<T>(path, { method: 'POST', json }),
  put: <T>(path: string, json?: any) => request<T>(path, { method: 'PUT', json }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  formPost: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form }),
  formPut: <T>(path: string, form: FormData) => request<T>(path, { method: 'PUT', form })
}
