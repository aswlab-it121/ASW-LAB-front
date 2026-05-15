import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usersApi } from '../api/usersApi'
import { ApiUser } from '../../issues/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    usersApi
      .get(userId)
      .then(setUser)
      .catch((err) => setError(err.message || 'Could not load user.'))
  }, [userId])

  if (error) return <div className="error-state">{error}</div>
  if (!user) return <div className="empty-state">Loading user...</div>

  return (
    <section className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-avatar-panel">
          <span className="profile-avatar">{user.photo ? <img src={user.photo} alt="" /> : user.username.slice(0, 1).toUpperCase()}</span>
          <h1>{user.full_name || user.username}</h1>
          <p>@{user.username}</p>
        </div>
        <p className={user.description ? 'profile-bio' : 'muted'}>{user.description || 'No profile description.'}</p>
        <div className="stats-grid">
          <div>
            <strong>{user.open_issues_count || 0}</strong>
            <span>Open</span>
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
      </aside>

      <main className="profile-content">
        <section className="profile-lists">
          <h2>Open assigned issues</h2>
          {(user.open_issues || []).length === 0 ? (
            <p className="muted">No open assigned issues.</p>
          ) : (
            <ul>
              {(user.open_issues || []).map((issue) => (
                <li key={issue.id}>
                  <Link to={`/issues/${issue.id}`}>#{issue.id} {issue.title}</Link>
                  <span>{issue.status?.name || 'No status'} · {formatDate(issue.updated_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-lists">
          <h2>Watched issues</h2>
          {(user.watched_issues || []).length === 0 ? (
            <p className="muted">No watched issues.</p>
          ) : (
            <ul>
              {(user.watched_issues || []).map((issue) => (
                <li key={issue.id}>
                  <Link to={`/issues/${issue.id}`}>#{issue.id} {issue.title}</Link>
                  <span>{formatDate(issue.updated_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-lists">
          <h2>Comments</h2>
          {(user.comments || []).length === 0 ? (
            <p className="muted">No comments.</p>
          ) : (
            <ul>
              {(user.comments || []).map((comment) => (
                <li key={comment.id}>
                  <Link to={`/issues/${comment.issue_id}`}>Issue #{comment.issue_id}</Link>
                  <span>{comment.comment} · {formatDate(comment.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </section>
  )
}

export default UserProfilePage
