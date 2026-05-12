import { api } from '../../../lib/api/http'
import { Issue, IssueSummary } from '../types'

export const issuesApi = {
  list: (filters?: any): Promise<{ data: IssueSummary[] }> => api.get(`/issues`),
  get: (id: string): Promise<{ data: Issue }> => api.get(`/issues/${id}`),
  create: (payload: Partial<Issue>) => api.post(`/issues`, { data: payload }),
  update: (id: string, payload: Partial<Issue>) => api.put(`/issues/${id}`, { data: payload }),
  delete: (id: string) => api.del(`/issues/${id}`),
  bulkInsert: (items: Partial<Issue>[]) => api.post(`/issues/bulk`, { data: items })
}
