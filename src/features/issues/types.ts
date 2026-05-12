export type Issue = {
  id: string
  number: number
  subject: string
  description?: string
  creatorId: string
  assigneeId?: string
  statusId?: string
  priorityId?: string
  typeId?: string
  severityId?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
  deadline?: string | null
}

export type IssueSummary = Pick<Issue, 'id' | 'number' | 'subject' | 'statusId' | 'priorityId' | 'assigneeId' | 'createdAt'>

export type IssueFilters = {
  status?: string
  assignee?: string
  q?: string
}

export type IssueSort = {
  field: 'number' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}
