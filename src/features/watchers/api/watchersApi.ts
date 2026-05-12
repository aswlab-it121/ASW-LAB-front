import { api } from '../../../lib/api/http'

export const watchersApi = {
  list: (issueId: string) => api.get(`/issues/${issueId}/watchers`),
  add: (issueId: string, userId: string) => api.post(`/issues/${issueId}/watchers`, { data: { userId } }),
  remove: (issueId: string, userId: string) => api.del(`/issues/${issueId}/watchers/${userId}`)
}
