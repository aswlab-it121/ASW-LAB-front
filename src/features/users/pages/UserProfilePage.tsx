import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usersApi } from '../api/usersApi'

const UserProfilePage: React.FC = () => {
  const { userId } = useParams()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!userId) return
    usersApi.get(userId).then((r) => setUser(r)).catch(console.error)
  }, [userId])

  if (!user) return <div>Loading user...</div>

  return (
    <div className="space-y-4">
      <div className="bg-white border p-4 rounded-md flex items-center gap-4">
        <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full" />
        <div>
          <h2 className="text-lg font-semibold">{user.displayName}</h2>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-md">Profile tabs placeholder (Assigned, Watched, Comments)</div>
    </div>
  )
}

export default UserProfilePage
