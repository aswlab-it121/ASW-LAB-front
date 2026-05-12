import { Issue } from '../features/issues/types'
import { AppUser } from '../app/store/userStore'

export function canEditIssue(issue: Issue, currentUser?: AppUser | null) {
  if (!currentUser) return false
  return issue.creatorId === currentUser.id
}

export function canDeleteIssue(issue: Issue, currentUser?: AppUser | null) {
  if (!currentUser) return false
  return issue.creatorId === currentUser.id
}

export function canEditComment(comment: { creatorId: string }, currentUser?: AppUser | null) {
  if (!currentUser) return false
  return comment.creatorId === currentUser.id
}

export function canDeleteComment(comment: { creatorId: string }, currentUser?: AppUser | null) {
  return canEditComment(comment, currentUser)
}

export function canDeleteAttachment(attachment: { creatorId: string }, currentUser?: AppUser | null) {
  if (!currentUser) return false
  return attachment.creatorId === currentUser.id
}
