import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usersApi } from '../api/usersApi'
import { ApiUser } from '../../issues/types'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [me, setMe] = useState<ApiUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const isOwnProfile = me !== null && user !== null && me.id === user.id

  useEffect(() => {
    if (!userId) return
    usersApi
      .get(userId)
      .then((u) => {
        setUser(u)
        setFirstName(u.first_name || '')
        setLastName(u.last_name || '')
        setDescription(u.description || '')
      })
      .catch((err) => setError(err.message || 'Could not load user.'))

    usersApi.me().then(setMe).catch(console.error)
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await usersApi.updateMe({ first_name: firstName, last_name: lastName, description })
      setUser((prev) => (prev ? { ...prev, ...updated } : prev))
      setMe(updated)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFirstName(user?.first_name || '')
    setLastName(user?.last_name || '')
    setDescription(user?.description || '')
    setIsEditing(false)
  }

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

        {isEditing ? (
          <div className="space-y-2 mt-2">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bio"
              className="border rounded-md px-3 py-2 text-sm w-full"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <p className={user.description ? 'profile-bio' : 'muted'}>{user.description || 'No profile description.'}</p>
            {isOwnProfile && (
              <Button className="mt-2" onClick={() => setIsEditing(true)}>Edit profile</Button>
            )}
          </>
        )}

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
