import React from 'react'
import { useUserStore } from '../app/store/userStore'
import { Select } from './ui/Select'

const UserSelector: React.FC = () => {
  const users = useUserStore((s) => s.users)
  const selectedId = useUserStore((s) => s.selectedId)
  const pendingSelectedId = useUserStore((s) => s.pendingSelectedId)
  const setSelected = useUserStore((s) => s.setSelected)

  const displayId = pendingSelectedId ?? selectedId
  const selectedUser = users.find((u) => u.id === displayId)
  const initials = selectedUser?.displayName.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-3">
      <span className="app-avatar app-avatar--small">
        {selectedUser?.avatarUrl ? <img src={selectedUser.avatarUrl} alt="" /> : initials}
      </span>
      <Select
        value={String(displayId)}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="Current API user"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.displayName} ({u.email})
          </option>
        ))}
      </Select>
      {pendingSelectedId !== null && (
        <span title="User switch will apply after saving the issue">⏳</span>
      )}
    </div>
  )
}

export default UserSelector
