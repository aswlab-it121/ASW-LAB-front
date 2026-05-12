import { api } from '../../../lib/api/http'

export const commentsApi = {
  list: (issueId: string) => api.get(`/issues/${issueId}/comments`),
  get: (issueId: string, commentId: string) => api.get(`/issues/${issueId}/comments/${commentId}`),
  create: (issueId: string, payload: any) => api.post(`/issues/${issueId}/comments`, { data: payload }),
  update: (issueId: string, commentId: string, payload: any) => api.put(`/issues/${issueId}/comments/${commentId}`, { data: payload }),
  delete: (issueId: string, commentId: string) => api.del(`/issues/${issueId}/comments/${commentId}`)
}
