import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { issuesApi } from '../api/issuesApi'

const BulkInsertPage: React.FC = () => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const titles = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (titles.length === 0) {
      setError('Enter at least one issue, one per line.')
      return
    }

    setLoading(true)
    try {
      await issuesApi.bulkInsert(titles.map((title) => ({ title })))
      nav('/issues')
    } catch (err: any) {
      setError(err.message || 'Could not create issues.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-page">
      <form className="bulk-dialog" onSubmit={onSubmit}>
        <div className="modal-head">
          <h1>Bulk new issues</h1>
          <button type="button" className="close-button" onClick={() => nav('/issues')} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="bulk-body">
          <p className="muted">Enter one issue per line. Each line becomes a new issue title and will be created with default values.</p>
          <textarea
            className="bulk-textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={'Issue title line 1\nIssue title line 2\nIssue title line 3'}
          />
          {error && <p className="bulk-error">{error}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={() => nav('/issues')}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create issues'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BulkInsertPage
