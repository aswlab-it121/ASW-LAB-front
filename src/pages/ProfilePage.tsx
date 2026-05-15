import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSelectedUser } from '../app/store/userStore'
import { usersApi } from '../features/users/api/usersApi'
import { ApiUser } from '../features/issues/types'

const ProfilePage: React.FC = () => {
  const selected = getSelectedUser()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    const profile = await usersApi.me()
    setUser(profile)
    setFirstName(profile.first_name || '')
    setLastName(profile.last_name || '')
    setDescription(profile.description || '')
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message || 'Could not load profile.'))
  }, [])

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      await usersApi.updateMe({ first_name: firstName, last_name: lastName, description })
      setMessage('Profile updated.')
      await load()
    } catch (err: any) {
      setMessage(err.message || 'Could not update profile.')
    }
  }

  async function uploadPicture(file: File | undefined) {
    if (!file) return
    setMessage(null)
    try {
      await usersApi.uploadMyPicture(file)
      setMessage('Profile picture updated.')
      await load()
    } catch (err: any) {
      setMessage(err.message || 'Could not upload picture.')
    }
  }

  if (!selected) return <div className="empty-state">No selected user.</div>
  if (!user) return <div className="empty-state">Loading profile...</div>

  return (
    <section className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-avatar-panel">
          <span className="profile-avatar">{user.photo ? <img src={user.photo} alt="" /> : user.username.slice(0, 1).toUpperCase()}</span>
          <h1>{user.full_name || user.username}</h1>
          <p>@{user.username}</p>
        </div>
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
        <div className="api-key-panel">
          <h2>API key</h2>
          <input readOnly value={selected.apiKey} />
          <p>Used by the hardcoded React user selector.</p>
        </div>
      </aside>

      <main className="profile-content">
        <h2>Profile settings</h2>
        {message && <div className="settings-message">{message}</div>}
        <form className="profile-form" onSubmit={saveProfile}>
          <label className="field">
            <span>First name</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="field">
            <span>Last name</span>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="field">
            <span>Profile picture</span>
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => uploadPicture(event.target.files?.[0])} />
          </label>
          <button type="submit" className="primary-button">
            Save profile
          </button>
        </form>

        <section className="profile-lists">
          <h2>Assigned issues</h2>
          {(user.open_issues || []).length === 0 ? (
            <p className="muted">No open assigned issues.</p>
          ) : (
            <ul>
              {(user.open_issues || []).map((issue) => (
                <li key={issue.id}>
                  <Link to={`/issues/${issue.id}`}>#{issue.id} {issue.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </section>
  )
}

export default ProfilePage
