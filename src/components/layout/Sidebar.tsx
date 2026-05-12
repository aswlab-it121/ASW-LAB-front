import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'block px-4 py-2 bg-blue-50 rounded-md' : 'block px-4 py-2 hover:bg-gray-100 rounded-md'

  return (
    <aside className="w-64 p-4 border-r hidden md:block bg-white">
      <nav className="flex flex-col gap-1">
        <NavLink to="/" className={linkClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/issues" className={linkClass}>
          Issues
        </NavLink>
        <NavLink to="/issues/new" className={linkClass}>
          New Issue
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
