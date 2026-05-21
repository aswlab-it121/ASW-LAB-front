import React from 'react'
import { Link } from 'react-router-dom'
import UserSelector from '../UserSelector'

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <Link to="/issues" className="app-brand">
        Issue Tracker
      </Link>
      <UserSelector />
    </header>
  )
}

export default Header
