import { api } from '../../../lib/api/http'

export const attachmentsApi = {
  list: (issueId: string) => api.get(`/issues/${issueId}/attachments`),
  upload: (issueId: string, form: FormData) => api.formPost(`/issues/${issueId}/attachments`, form),
  delete: (issueId: string, attachmentId: string) => api.del(`/issues/${issueId}/attachments/${attachmentId}`)
}
