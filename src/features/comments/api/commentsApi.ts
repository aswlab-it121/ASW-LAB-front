import { api } from '../../../lib/api/http'
import { IssueComment } from '../../issues/types'

export const commentsApi = {
  list: (issueId: string | number): Promise<IssueComment[]> => api.get(`/issues/${issueId}/comments/`),
  create: (issueId: string | number, comment: string): Promise<IssueComment> =>
    api.post(`/issues/${issueId}/comments/`, { comment }),
  update: (issueId: string | number, commentId: string | number, comment: string): Promise<IssueComment> =>
    api.put(`/issues/${issueId}/comments/${commentId}/`, { comment }),
  delete: (issueId: string | number, commentId: string | number): Promise<{ deleted: boolean; id: number }> =>
    api.del(`/issues/${issueId}/comments/${commentId}/`)
}
