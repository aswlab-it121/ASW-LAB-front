import React from 'react'

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white p-4 border rounded-md">Statuses (CRUD placeholder)</section>
        <section className="bg-white p-4 border rounded-md">Priorities (CRUD placeholder)</section>
        <section className="bg-white p-4 border rounded-md">Types (CRUD placeholder)</section>
        <section className="bg-white p-4 border rounded-md">Severities / Tags / Due dates</section>
      </div>
    </div>
  )
}

export default SettingsPage
