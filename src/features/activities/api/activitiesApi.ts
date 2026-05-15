import { api } from '../../../lib/api/http'
import { ActivityLog } from '../../issues/types'

export const activitiesApi = {
  list: (issueId: string | number): Promise<ActivityLog[]> => api.get(`/issues/${issueId}/activity/`)
}
