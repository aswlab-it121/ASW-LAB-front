import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 border rounded-md">Overview / widgets</div>
      <div className="bg-white p-4 border rounded-md">Recent activity</div>
    </div>
  )
}

export default Dashboard
