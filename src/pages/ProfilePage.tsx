import React from 'react'
import { getSelectedUser } from '../app/store/userStore'
import { Link } from 'react-router-dom'

const ProfilePage: React.FC = () => {
  const user = getSelectedUser()
  if (!user) return <div>No selected user</div>

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border rounded-md flex items-center gap-4">
        <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full" />
        <div>
          <h2 className="text-lg font-semibold">{user.displayName}</h2>
          <div className="text-sm text-gray-600">{user.email}</div>
          <div className="mt-2">
            <Link to={`/users/${user.id}`} className="text-blue-600">View full profile</Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 border rounded-md">Profile tabs placeholder</div>
    </div>
  )
}

export default ProfilePage
