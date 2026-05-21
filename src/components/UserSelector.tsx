import React from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../app/store/userStore'
import { Select } from './ui/Select'

const UserSelector: React.FC = () => {
  const users = useUserStore((s) => s.users)
  const selectedId = useUserStore((s) => s.selectedId)
  const setSelected = useUserStore((s) => s.setSelected)

  const selectedUser = users.find((u) => u.id === selectedId)
  const initials = selectedUser?.displayName.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-3">
      <Link to="/profile" className="app-avatar app-avatar--small profile-avatar-link" aria-label="View my profile">
        {selectedUser?.avatarUrl ? <img src={selectedUser.avatarUrl} alt="" /> : initials}
      </Link>
      <Select value={String(selectedId)} onChange={(e) => setSelected(e.target.value)} aria-label="Current API user">
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.displayName} ({u.email})
          </option>
        ))}
      </Select>
    </div>
  )
}

export default UserSelector
