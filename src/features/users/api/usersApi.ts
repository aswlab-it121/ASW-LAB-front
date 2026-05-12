import { api } from '../../../lib/api/http'

export const usersApi = {
  list: () => api.get(`/users`),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, payload: any) => api.put(`/users/${id}`, { data: payload }),
  uploadAvatar: (id: string, form: FormData) => api.formPost(`/users/${id}/avatar`, form)
}
