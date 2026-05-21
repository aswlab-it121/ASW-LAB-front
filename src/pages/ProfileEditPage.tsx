import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../app/store/userStore'
import { usersApi } from '../features/users/api/usersApi'
import { ApiUser } from '../features/issues/types'

const ProfileEditPage: React.FC = () => {
  const selectedId = useUserStore((state) => state.selectedId)
  const selected = useUserStore((state) => state.users.find((user) => user.id === state.selectedId))
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
    setUser(null)
    setMessage(null)
    load().catch((err) => setMessage(err.message || 'Could not load profile.'))
  }, [selectedId])

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
        <div className="profile-content-head">
          <h2>Edit profile</h2>
          <Link to="/profile" className="secondary-button">
            View profile
          </Link>
        </div>
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
      </main>
    </section>
  )
}

export default ProfileEditPage
