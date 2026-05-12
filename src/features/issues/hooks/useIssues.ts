import { useEffect, useState } from 'react'
import { issuesApi } from '../api/issuesApi'
import { IssueSummary, IssueFilters, IssueSort } from '../types'

export function useIssues(draftFilters?: IssueFilters, sort?: IssueSort) {
  const [data, setData] = useState<IssueSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetchIssues(applied?: IssueFilters) {
    setLoading(true)
    setError(null)
    try {
      const res = await issuesApi.list(applied)
      setData(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues(draftFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(draftFilters), JSON.stringify(sort)])

  return { data, loading, error, reload: () => fetchIssues(draftFilters) }
}
