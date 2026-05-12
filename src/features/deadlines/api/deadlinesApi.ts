import { api } from '../../../lib/api/http'

export const deadlinesApi = {
  list: (issueId: string) => api.get(`/issues/${issueId}/deadlines`),
  add: (issueId: string, payload: any) => api.post(`/issues/${issueId}/deadlines`, { data: payload }),
  delete: (issueId: string, deadlineId: string) => api.del(`/issues/${issueId}/deadlines/${deadlineId}`)
}
