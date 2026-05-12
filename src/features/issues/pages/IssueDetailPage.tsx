import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { issuesApi } from '../api/issuesApi'

const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!issueId) return
    setLoading(true)
    issuesApi
      .get(issueId)
      .then((r) => setIssue(r.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [issueId])

  if (loading) return <div>Loading...</div>
  if (!issue) return <div>No issue found</div>

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border rounded-md">
        <h2 className="text-xl font-semibold">#{issue.number} {issue.subject}</h2>
        <p className="text-sm text-gray-700">{issue.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white p-4 border rounded-md">Comments (placeholder)</section>
        <section className="bg-white p-4 border rounded-md">Attachments (placeholder)</section>
      </div>
    </div>
  )
}

export default IssueDetailPage
