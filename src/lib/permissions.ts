import { AppUser } from '../app/store/userStore'
import { Issue, IssueAttachment, IssueComment } from '../features/issues/types'

type Actor = { id?: number; username?: string | null; email?: string | null } | null | undefined

/** Match the user implied by the API key (`/users/me`) and/or the selector in the UI. */
export function matchesActor(actor: Actor, currentUser?: AppUser | null, apiUserId?: number | null) {
  if (!actor) return false
  if (apiUserId != null && actor.id === apiUserId) return true
  if (!currentUser) return false
  if (actor.id === currentUser.id) return true

  const leftUsername = (currentUser.username || '').trim().toLowerCase()
  const rightUsername = (actor.username || '').trim().toLowerCase()
  if (leftUsername && rightUsername && leftUsername === rightUsername) return true

  const leftEmail = (currentUser.email || '').trim().toLowerCase()
  const rightEmail = (actor.email || '').trim().toLowerCase()
  if (leftEmail && rightEmail && leftEmail === rightEmail) return true

  return false
}

export function canEditIssue(issue: Issue, currentUser?: AppUser | null, apiUserId?: number | null) {
  return matchesActor(issue.created_by, currentUser, apiUserId)
}

export function canDeleteIssue(issue: Issue, currentUser?: AppUser | null, apiUserId?: number | null) {
  return canEditIssue(issue, currentUser, apiUserId)
}

export function canEditComment(comment: IssueComment, currentUser?: AppUser | null, apiUserId?: number | null) {
  return matchesActor(comment.user, currentUser, apiUserId)
}

export function canDeleteComment(comment: IssueComment, currentUser?: AppUser | null, apiUserId?: number | null) {
  return canEditComment(comment, currentUser, apiUserId)
}

/** Only the user who uploaded the attachment (on any issue). */
export function canDeleteAttachment(
  attachment: IssueAttachment,
  currentUser?: AppUser | null,
  _issue?: Pick<Issue, 'created_by'> | null,
  apiUserId?: number | null
) {
  if (apiUserId == null && !currentUser) return false
  return matchesActor(attachment.owner, currentUser, apiUserId)
}
