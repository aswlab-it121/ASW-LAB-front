import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useUserStore } from '../../../app/store/userStore'
import { commentsApi } from '../../comments/api/commentsApi'
import { ApiUser, UserCommentEntry, UserIssueEntry } from '../../issues/types'
import { usersApi } from '../api/usersApi'

type ProfileTab = 'assigned' | 'watched' | 'comments'

type UserProfilePageProps = {
  ownProfile?: boolean
}

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'assigned', label: 'Open assigned issues' },
  { id: 'watched', label: 'Watched issues' },
  { id: 'comments', label: 'Comments' }
]

function formatDate(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatDateTime(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function issueDotStyle(color?: string | null) {
  return { '--dot-color': color || '#c7cad4' } as React.CSSProperties
}

function statusStyle(color?: string | null) {
  return { '--status-color': color || '#47a5ef' } as React.CSSProperties
}

function IssueTable({ issues, emptyText }: { issues: UserIssueEntry[]; emptyText: string }) {
  if (issues.length === 0) return <div className="empty-state">{emptyText}</div>

  return (
    <div className="profile-issues-table">
      <div className="profile-issues-head">
        <span>Type</span>
        <span>Sev</span>
        <span>Pri</span>
        <span>Issue</span>
        <span>Status</span>
        <span>Modified</span>
      </div>
      {issues.map((issue) => (
        <Link to={`/issues/${issue.id}`} className="profile-issue-row" key={issue.id}>
          <span className="issue-dot" style={issueDotStyle(issue.type?.color)} title={issue.type?.name || 'Type not set'} />
          <span className="issue-dot" style={issueDotStyle(issue.severity?.color)} title={issue.severity?.name || 'Severity not set'} />
          <span className="issue-dot" style={issueDotStyle(issue.priority?.color)} title={issue.priority?.name || 'Priority not set'} />
          <div className="profile-issue-summary">
            <span className="profile-issue-id">#{issue.id}</span>
            <span className="profile-issue-title">{issue.title || 'Untitled issue'}</span>
          </div>
          <span className="profile-issue-status" style={statusStyle(issue.status?.color)}>
            {issue.status?.name || 'New'}
          </span>
          <span className="profile-issue-modified">{formatDate(issue.updated_at)}</span>
        </Link>
      ))}
    </div>
  )
}

type CommentListProps = {
  comments: UserCommentEntry[]
  canManage: boolean
  editingCommentId: number | null
  editingCommentText: string
  busyCommentId: number | null
  onStartEdit: (comment: UserCommentEntry) => void
  onCancelEdit: () => void
  onEditTextChange: (value: string) => void
  onSaveEdit: (comment: UserCommentEntry) => void
  onDelete: (comment: UserCommentEntry) => void
}

function CommentList({
  comments,
  canManage,
  editingCommentId,
  editingCommentText,
  busyCommentId,
  onStartEdit,
  onCancelEdit,
  onEditTextChange,
  onSaveEdit,
  onDelete
}: CommentListProps) {
  if (comments.length === 0) return <div className="empty-state">No comments yet.</div>

  return (
    <ul className="profile-comments-list">
      {comments.map((comment) => (
        <li className="profile-comment-card" key={comment.id}>
          <div className="profile-comment-head">
            <div className="profile-comment-issue">
              <Link to={`/issues/${comment.issue_id}`} className="profile-comment-issue-id">
                #{comment.issue_id}
              </Link>
              <Link to={`/issues/${comment.issue_id}`} className="profile-comment-issue-title">
                {comment.issue_title || `Issue #${comment.issue_id}`}
              </Link>
            </div>
            <span>{formatDateTime(comment.created_at)}</span>
          </div>
          {editingCommentId === comment.id ? (
            <div className="profile-comment-edit">
              <textarea value={editingCommentText} onChange={(event) => onEditTextChange(event.target.value)} />
              <div className="profile-comment-actions">
                <button type="button" className="primary-button" onClick={() => onSaveEdit(comment)} disabled={busyCommentId === comment.id}>
                  Save
                </button>
                <button type="button" className="secondary-button" onClick={onCancelEdit}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p>{comment.comment}</p>
          )}
          {canManage && editingCommentId !== comment.id && (
            <div className="profile-comment-actions">
              <button type="button" className="settings-icon-btn" onClick={() => onStartEdit(comment)} aria-label="Edit comment">
                <Pencil size={16} />
              </button>
              <button type="button" className="settings-icon-btn is-danger" onClick={() => onDelete(comment)} aria-label="Delete comment" disabled={busyCommentId === comment.id}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ ownProfile = false }) => {
  const { userId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = useUserStore((state) => state.selectedId)
  const selected = useUserStore((state) => state.users.find((user) => user.id === state.selectedId))
  const [user, setUser] = useState<ApiUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [busyCommentId, setBusyCommentId] = useState<number | null>(null)

  const fetchProfile = useCallback(() => {
    return ownProfile ? usersApi.me() : userId ? usersApi.get(userId) : Promise.reject(new Error('Missing user id.'))
  }, [ownProfile, userId])

  useEffect(() => {
    setUser(null)
    setError(null)
    setProfileMessage(null)
    setEditingCommentId(null)
    setEditingCommentText('')
    fetchProfile().then(setUser).catch((err) => setError(err.message || 'Could not load user.'))
  }, [fetchProfile, selectedId])

  const activeTab = useMemo<ProfileTab>(() => {
    const requested = searchParams.get('tab')
    return tabs.some((tab) => tab.id === requested) ? (requested as ProfileTab) : 'assigned'
  }, [searchParams])

  function selectTab(tab: ProfileTab) {
    setSearchParams(tab === 'assigned' ? {} : { tab })
  }

  function startEditComment(comment: UserCommentEntry) {
    setProfileMessage(null)
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.comment)
  }

  function cancelEditComment() {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  async function saveProfileComment(comment: UserCommentEntry) {
    const nextText = editingCommentText.trim()
    if (!nextText) return
    setBusyCommentId(comment.id)
    setProfileMessage(null)
    try {
      await commentsApi.update(comment.issue_id, comment.id, nextText)
      const nextProfile = await fetchProfile()
      setUser(nextProfile)
      setEditingCommentId(null)
      setEditingCommentText('')
      setProfileMessage('Comment updated.')
    } catch (err: any) {
      setProfileMessage(err.message || 'Could not update comment.')
    } finally {
      setBusyCommentId(null)
    }
  }

  async function deleteProfileComment(comment: UserCommentEntry) {
    if (!window.confirm('Delete this comment?')) return
    setBusyCommentId(comment.id)
    setProfileMessage(null)
    try {
      await commentsApi.delete(comment.issue_id, comment.id)
      const nextProfile = await fetchProfile()
      setUser(nextProfile)
      if (editingCommentId === comment.id) cancelEditComment()
      setProfileMessage('Comment deleted.')
    } catch (err: any) {
      setProfileMessage(err.message || 'Could not delete comment.')
    } finally {
      setBusyCommentId(null)
    }
  }

  if (error) return <div className="error-state">{error}</div>
  if (!user) return <div className="empty-state">Loading user...</div>

  const displayName = user.full_name || user.username
  const isOwnProfile = ownProfile || selectedId === user.id
  const openIssues = user.open_issues || []
  const watchedIssues = user.watched_issues || []
  const comments = user.comments || []

  return (
    <section className="profile-page profile-page--view">
      <aside className="profile-sidebar">
        <div className="profile-avatar-panel">
          <span className="profile-avatar">{user.photo ? <img src={user.photo} alt={`${displayName} profile`} /> : user.username.slice(0, 1).toUpperCase()}</span>
        </div>

        <div className="profile-title-block">
          <h1>{displayName}</h1>
          <p>@{user.username}</p>
        </div>

        <div className="stats-grid">
          <div>
            <strong>{user.open_issues_count || 0}</strong>
            <span>Open Issues</span>
          </div>
          <div>
            <strong>{user.watched_count || 0}</strong>
            <span>Watched</span>
          </div>
          <div>
            <strong>{user.comments_count || 0}</strong>
            <span>Comments</span>
          </div>
        </div>

        <p className={user.description ? 'profile-bio' : 'profile-bio-empty'}>{user.description || 'No bio yet.'}</p>

        <div className="sidebar-actions">
          {isOwnProfile && (
            <Link to="/profile/edit" className="primary-button">
              Edit Profile
            </Link>
          )}
          <Link to="/issues" className="secondary-button">
            Back to issues
          </Link>
        </div>

        {isOwnProfile && selected && (
          <div className="api-key-panel">
            <h2>Your API key</h2>
            <input readOnly value={selected.apiKey} />
            <p>Use it as the X-Api-Key header in API requests.</p>
          </div>
        )}
      </aside>

      <main className="profile-content">
        {profileMessage && <div className="settings-message">{profileMessage}</div>}
        <nav className="profile-tabs" aria-label="Profile sections">
          {tabs.map((tab) => (
            <button type="button" className={activeTab === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => selectTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'assigned' && <IssueTable issues={openIssues} emptyText="No open assigned issues." />}
        {activeTab === 'watched' && <IssueTable issues={watchedIssues} emptyText="No watched issues." />}
        {activeTab === 'comments' && (
          <CommentList
            comments={comments}
            canManage={isOwnProfile}
            editingCommentId={editingCommentId}
            editingCommentText={editingCommentText}
            busyCommentId={busyCommentId}
            onStartEdit={startEditComment}
            onCancelEdit={cancelEditComment}
            onEditTextChange={setEditingCommentText}
            onSaveEdit={saveProfileComment}
            onDelete={deleteProfileComment}
          />
        )}
      </main>
    </section>
  )
}

export default UserProfilePage
