import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssues } from '../hooks/useIssues'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'

const IssuesListPage: React.FC = () => {
  const [draftQ, setDraftQ] = useState('')
  const [applied, setApplied] = useState<{ q?: string } | undefined>(undefined)
  const { data, loading } = useIssues(applied)
  const nav = useNavigate()

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Input placeholder="Search subject or description" value={draftQ} onChange={(e) => setDraftQ(e.target.value)} />
        <Button onClick={() => setApplied(draftQ ? { q: draftQ } : undefined)}>Search</Button>
        <Button variant="ghost" onClick={() => nav('/issues/new')}>New</Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : data.length === 0 ? (
        <div>No issues</div>
      ) : (
        <ul className="space-y-2">
          {data.map((i) => (
            <li key={i.id} className="p-3 bg-white rounded-md border">
              <a href={`/issues/${i.id}`} className="font-medium text-blue-600">
                #{i.number} {i.subject}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default IssuesListPage
