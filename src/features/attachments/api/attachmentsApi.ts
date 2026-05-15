import { api } from '../../../lib/api/http'
import { IssueAttachment } from '../../issues/types'

export const attachmentsApi = {
  list: (issueId: string | number): Promise<IssueAttachment[]> => api.get(`/issues/${issueId}/attachments/`),
  upload: (issueId: string | number, files: FileList | File[]): Promise<IssueAttachment[]> => {
    const form = new FormData()
    Array.from(files).forEach((file) => form.append('attachments', file))
    return api.formPost(`/issues/${issueId}/attachments/`, form)
  },
  delete: (issueId: string | number, attachmentId: string | number): Promise<{ deleted: boolean; id: number }> =>
    api.del(`/issues/${issueId}/attachments/${attachmentId}/`)
}
