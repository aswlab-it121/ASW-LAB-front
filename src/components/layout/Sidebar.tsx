import React from 'react'
import { NavLink } from 'react-router-dom'
import { ListPlus, ListTodo, Plus, Settings, UserCircle } from 'lucide-react'

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'side-link is-active' : 'side-link'

  return (
    <aside className="app-sidebar">
      <nav className="side-nav">
        <NavLink to="/issues" className={linkClass}>
          <ListTodo size={18} />
          Issues
        </NavLink>
        <NavLink to="/issues/new" className={linkClass}>
          <Plus size={18} />
          New Issue
        </NavLink>
        <NavLink to="/issues/bulk-insert" className={linkClass}>
          <ListPlus size={18} />
          Bulk Insert
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={18} />
          Settings
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <UserCircle size={18} />
          Profile
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
