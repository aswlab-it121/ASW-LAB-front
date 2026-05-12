import React from 'react'
import UserSelector from '../UserSelector'

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Issue Tracker</h1>
      </div>
      <div className="flex items-center gap-4">
        <UserSelector />
      </div>
    </header>
  )
}

export default Header
