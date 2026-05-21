import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import IssuesListPage from './features/issues/pages/IssuesListPage'
import IssueNewPage from './features/issues/pages/IssueNewPage'
import IssueDetailPage from './features/issues/pages/IssueDetailPage'
import BulkInsertPage from './features/issues/pages/BulkInsertPage'
import SettingsPage from './pages/SettingsPage'
import UserProfilePage from './features/users/pages/UserProfilePage'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'

const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/issues" replace />} />
        <Route path="/issues" element={<IssuesListPage />} />
        <Route path="/issues/new" element={<IssueNewPage />} />
        <Route path="/issues/bulk-insert" element={<BulkInsertPage />} />
        <Route path="/issues/:issueId" element={<IssueDetailPage />} />
        <Route path="/issues/:issueId/edit" element={<IssueDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
