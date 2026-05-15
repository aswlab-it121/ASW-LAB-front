import { AppUser } from '../app/store/userStore'
import { Issue, IssueAttachment, IssueComment } from '../features/issues/types'

export function canEditIssue(issue: Issue, currentUser?: AppUser | null) {
  if (!currentUser || !issue.created_by) return false
  return issue.created_by.id === currentUser.id
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
