import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation()
  const hideSidebar = pathname === '/issues/new' || pathname === '/issues/bulk-insert'

  return (
    <div className="app-root">
      <Header />
      <div className={`app-body ${hideSidebar ? 'app-body--no-sidebar' : ''}`}>
        {!hideSidebar && <Sidebar />}
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
