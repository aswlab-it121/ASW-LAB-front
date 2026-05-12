import { api } from '../../../lib/api/http'

export const activitiesApi = {
  list: (issueId: string) => api.get(`/issues/${issueId}/activities`)
}
