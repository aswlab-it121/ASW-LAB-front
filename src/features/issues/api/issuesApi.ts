import { api } from '../../../lib/api/http'
import { Issue, IssueFilters, IssuePayload } from '../types'

export const issuesApi = {
  list: (filters?: IssueFilters): Promise<Issue[]> => api.get('/issues/', filters),
  get: (id: string | number): Promise<Issue> => api.get(`/issues/${id}/`),
  create: (payload: IssuePayload): Promise<Issue> => api.post('/issues/', payload),
  update: (id: string | number, payload: Partial<IssuePayload>): Promise<Issue> => api.put(`/issues/${id}/`, payload),
  delete: (id: string | number): Promise<{ deleted: boolean; id: number }> => api.del(`/issues/${id}/`),
  bulkInsert: (items: IssuePayload[]): Promise<Issue[]> => api.post('/issues/bulk/', items)
}
