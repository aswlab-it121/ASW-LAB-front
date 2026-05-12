import React from 'react'
import { useUserStore } from '../app/store/userStore'
import { Select } from './ui/Select'

const UserSelector: React.FC = () => {
  const users = useUserStore((s) => s.users)
  const selectedId = useUserStore((s) => s.selectedId)
  const setSelected = useUserStore((s) => s.setSelected)

  return (
    <div className="flex items-center gap-3">
      <img src={users.find((u) => u.id === selectedId)?.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
      <Select value={selectedId} onChange={(e) => setSelected(e.target.value)}>
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
