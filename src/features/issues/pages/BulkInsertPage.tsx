import React, { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { issuesApi } from '../api/issuesApi'

const BulkInsertPage: React.FC = () => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    setError(null)
    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('Expected JSON array of issues')
      setLoading(true)
      await issuesApi.bulkInsert(parsed)
      setText('')
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Bulk Insert Issues</h2>
      <p className="text-sm text-gray-600 mb-2">Provide a JSON array of issue objects (subject, description, ...)</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full min-h-[200px] p-2 border rounded-md" />
      <div className="flex gap-2 mt-2">
        <Button onClick={onSubmit} disabled={loading}>Submit</Button>
        <Button variant="ghost" onClick={() => setText('')}>Clear</Button>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  )
}

export default BulkInsertPage
