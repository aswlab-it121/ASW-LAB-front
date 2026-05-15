import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-root">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
