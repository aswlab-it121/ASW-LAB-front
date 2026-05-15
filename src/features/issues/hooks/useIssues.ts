import { useEffect, useState } from 'react'
import { issuesApi } from '../api/issuesApi'
import { Issue, IssueFilters } from '../types'

export function useIssues(filters?: IssueFilters) {
  const [data, setData] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetchIssues(applied?: IssueFilters) {
    setLoading(true)
    setError(null)
    try {
      const res = await issuesApi.list(applied)
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { data, loading, error, reload: () => fetchIssues(filters) }
}
