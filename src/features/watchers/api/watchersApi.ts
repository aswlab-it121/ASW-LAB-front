import { api } from '../../../lib/api/http'
import { ApiUserBrief } from '../../issues/types'

export const watchersApi = {
  list: (issueId: string | number): Promise<ApiUserBrief[]> => api.get(`/issues/${issueId}/watchers/`),
  add: (issueId: string | number, userId: string | number): Promise<ApiUserBrief> =>
    api.post(`/issues/${issueId}/watchers/`, { user_id: Number(userId) }),
  remove: (issueId: string | number, userId: string | number): Promise<{ deleted: boolean; user_id: number }> =>
    api.del(`/issues/${issueId}/watchers/${userId}/`)
}
