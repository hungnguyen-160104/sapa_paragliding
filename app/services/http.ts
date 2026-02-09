import { $fetch, type FetchOptions } from 'ofetch'

const baseURL = '/api'

type ApiFetchOptions<T> = FetchOptions<T> & {
  auth?: boolean
}

export const apiFetch = async <T>(url: string, options: ApiFetchOptions<T> = {}) => {
  const { auth = true, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (auth && process.client) {
    const token = localStorage.getItem('adminToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return $fetch<T>(`${baseURL}${url}`, {
    ...rest,
    headers: {
      ...headers,
      ...(rest.headers as Record<string, string> | undefined)
    }
  })
}
