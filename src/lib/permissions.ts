import { AppUser } from '../app/store/userStore'
import { Issue, IssueAttachment, IssueComment } from '../features/issues/types'

function isSameUser(currentUser?: AppUser | null, other?: { id?: number; username?: string | null; email?: string | null } | null) {
  if (!currentUser || !other) return false
  if (typeof other.id === 'number' && other.id === currentUser.id) return true

  const leftUsername = (currentUser.username || '').trim().toLowerCase()
  const rightUsername = (other.username || '').trim().toLowerCase()
  if (leftUsername && rightUsername && leftUsername === rightUsername) return true

  const leftEmail = (currentUser.email || '').trim().toLowerCase()
  const rightEmail = (other.email || '').trim().toLowerCase()
  if (leftEmail && rightEmail && leftEmail === rightEmail) return true

  return false
}

export function canEditIssue(issue: Issue, currentUser?: AppUser | null) {
  return isSameUser(currentUser, issue.created_by)
}

export function canDeleteIssue(issue: Issue, currentUser?: AppUser | null) {
  return canEditIssue(issue, currentUser)
}

export function canEditComment(comment: IssueComment, currentUser?: AppUser | null) {
  if (!currentUser || !comment.user) return false
  return comment.user.id === currentUser.id
}

export function canDeleteComment(comment: IssueComment, currentUser?: AppUser | null) {
  return canEditComment(comment, currentUser)
}

export function canDeleteAttachment(attachment: IssueAttachment, currentUser?: AppUser | null) {
  if (!currentUser || !attachment.owner) return false
  return attachment.owner.id === currentUser.id
}
