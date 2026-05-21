export type ApiUserBrief = {
  id: number
  username: string
  is_active?: boolean
  photo?: string | null
}

export type ApiUser = ApiUserBrief & {
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  date_joined?: string
  last_login?: string | null
  description?: string
  open_issues_count?: number
  watched_count?: number
  comments_count?: number
  open_issues?: UserIssueEntry[]
  watched_issues?: UserIssueEntry[]
  comments?: UserCommentEntry[]
}

export type ReferenceItem = {
  id: number
  name: string
  color: string
  order: number
}

export type IssueStatus = ReferenceItem & {
  is_closed: boolean
}

export type DueDateStatus = ReferenceItem & {
  days: number | null
  timing: 'before' | 'after' | null
  is_default: boolean
}

export type Issue = {
  id: number
  title: string
  description: string
  blocker: string | null
  due_date: string | null
  type: ReferenceItem | null
  severity: ReferenceItem | null
  priority: ReferenceItem | null
  status: IssueStatus | null
  assigned_to: ApiUserBrief | null
  created_by: ApiUserBrief | null
  tags: ReferenceItem[]
  created_at: string
  updated_at: string
}

export type IssuePayload = {
  title: string
  description?: string
  blocker?: string | null
  due_date?: string | null
  type_id?: number | null
  severity_id?: number | null
  priority_id?: number | null
  status_id?: number | null
  assigned_to_id?: number | null
  tag_ids?: number[]
  new_tags?: Array<{ name: string; color?: string }>
  watcher_ids?: number[]
}

export type IssueFilters = {
  q?: string
  type?: number | ''
  status?: number | ''
  severity?: number | ''
  priority?: number | ''
  assigned_to?: number | ''
  order_by?: string
}

export type IssueComment = {
  id: number
  comment: string
  user: ApiUserBrief | null
  created_at: string
  url?: string
}

export type IssueAttachment = {
  id: number
  original_name: string
  content_type: string
  size: number
  url: string | null
  owner: ApiUserBrief | null
  created_at: string
}

export type ActivityLog = {
  id: number
  action: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  user: ApiUserBrief | null
  timestamp: string
}

export type UserIssueEntry = {
  id: number
  title: string
  type: ReferenceItem | null
  severity: ReferenceItem | null
  priority: ReferenceItem | null
  status: IssueStatus | null
  updated_at: string
  url: string
}

export type UserCommentEntry = {
  id: number
  comment: string
  issue_id: number
  issue_title?: string
  created_at: string
  url: string
}
