import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Clock, Filter, ListPlus, Lock, Plus, Search, Settings } from 'lucide-react'
import { getSelectedUser } from '../../../app/store/userStore'
import { canEditIssue } from '../../../lib/permissions'
import { useIssues } from '../hooks/useIssues'
import { issuesApi } from '../api/issuesApi'
import { usersApi } from '../../users/api/usersApi'
import { settingsApi } from '../../settings/api/settingsApi'
import { ApiUser, DueDateStatus, Issue } from '../types'

type SortKey = 'type' | 'severity' | 'priority' | 'issue' | 'status' | 'modified' | 'assigned'
type FilterKey = 'type' | 'severity' | 'priority' | 'status' | 'assigned'

const filterKeys: Array<{ key: FilterKey; label: string }> = [
  { key: 'type', label: 'Type' },
  { key: 'severity', label: 'Severity' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'assigned', label: 'Assigned to' }
]

function initials(name?: string) {
  return (name || 'UN').slice(0, 2).toUpperCase()
}

function readableDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function sortValue(issue: Issue, key: SortKey) {
  if (key === 'type') return issue.type?.name || ''
  if (key === 'severity') return issue.severity?.name || ''
  if (key === 'priority') return issue.priority?.name || ''
  if (key === 'issue') return issue.title || ''
  if (key === 'status') return issue.status?.name || ''
  if (key === 'assigned') return issue.assigned_to?.username || ''
  return new Date(issue.updated_at).getTime()
}

function filterValue(issue: Issue, key: FilterKey) {
  if (key === 'assigned') return issue.assigned_to?.username || ''
  return sortValue(issue, key as SortKey).toString()
}

function searchText(issue: Issue) {
  return [
    issue.id,
    issue.title,
    issue.description,
    issue.assigned_to?.username,
    issue.status?.name,
    issue.type?.name,
    issue.severity?.name,
    issue.priority?.name,
    ...issue.tags.map((tag) => tag.name)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function resolveDueDateColor(issue: Issue, statuses: DueDateStatus[]) {
  if (!issue.due_date || statuses.length === 0) return '#7f8ea3'
  const due = new Date(`${issue.due_date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  const fallback = statuses.find((status) => status.is_default) || statuses[0]
  const match = statuses.find((status) => {
    if (status.is_default || status.days == null || !status.timing) return false
    if (status.timing === 'before') return diff >= 0 && diff <= status.days
    return diff <= -status.days
  })
  return (match || fallback)?.color || '#7f8ea3'
}

const IssuesListPage: React.FC = () => {
  const { data: issues, loading, error, reload } = useIssues()
  const currentUser = getSelectedUser()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [dueStatuses, setDueStatuses] = useState<DueDateStatus[]>([])
  const [query, setQuery] = useState('')
  const [showTags, setShowTags] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterKey, string[]>>({
    type: [],
    severity: [],
    priority: [],
    status: [],
    assigned: []
  })
  const [sortKey, setSortKey] = useState<SortKey>('modified')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [assigneeIssue, setAssigneeIssue] = useState<Issue | null>(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [savingAssignee, setSavingAssignee] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    usersApi.list().then(setUsers).catch(console.error)
    settingsApi.list<DueDateStatus>('due-date-statuses').then(setDueStatuses).catch(console.error)
  }, [])

  const filterOptions = useMemo(() => {
    const result: Record<FilterKey, string[]> = {
      type: [],
      severity: [],
      priority: [],
      status: [],
      assigned: []
    }
    filterKeys.forEach(({ key }) => {
      result[key] = Array.from(new Set(issues.map((issue) => filterValue(issue, key)).filter(Boolean))).sort()
    })
    return result
  }, [issues])

  const visibleIssues = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = issues.filter((issue) => {
      const matchesSearch = !normalized || searchText(issue).includes(normalized)
      const matchesFilters = filterKeys.every(({ key }) => {
        const selected = selectedFilters[key]
        return selected.length === 0 || selected.includes(filterValue(issue, key))
      })
      return matchesSearch && matchesFilters
    })

    return filtered.sort((left, right) => {
      const leftValue = sortValue(left, sortKey)
      const rightValue = sortValue(right, sortKey)
      const compared =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue))
      return sortDirection === 'desc' ? compared * -1 : compared
    })
  }, [issues, query, selectedFilters, sortDirection, sortKey])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection(key === 'modified' ? 'desc' : 'asc')
    }
  }

  function toggleFilter(key: FilterKey, value: string) {
    setSelectedFilters((current) => {
      const values = current[key]
      return {
        ...current,
        [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
      }
    })
  }

  function clearFilters() {
    setSelectedFilters({ type: [], severity: [], priority: [], status: [], assigned: [] })
  }

  async function saveAssignee() {
    if (!assigneeIssue) return
    if (!canEditIssue(assigneeIssue, currentUser)) {
      setAssigneeIssue(null)
      return
    }
    setSavingAssignee(true)
    try {
      await issuesApi.update(assigneeIssue.id, { assigned_to_id: assigneeId ? Number(assigneeId) : null })
      setAssigneeIssue(null)
      await reload()
    } finally {
      setSavingAssignee(false)
    }
  }

  return (
    <section className="issues-page">
      <div className="page-header">
        <h1>Issues</h1>
        <div className="header-actions">
          <Link to="/settings" className="icon-button" aria-label="Issue settings">
            <Settings size={19} />
          </Link>
          <Link to="/profile" className="icon-button owner-link" aria-label="View profile">
            Profile
          </Link>
        </div>
      </div>

      <div className="issues-toolbar">
        <div className="toolbar-group">
          <button className="filter-button" type="button" onClick={() => setFiltersOpen((current) => !current)}>
            <Filter size={18} />
            Filters
          </button>
          <label className="search-control">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by id, title, assignee, or tag" />
            <Search size={18} />
          </label>
          <button className={`toggle-control ${showTags ? '' : 'is-off'}`} type="button" onClick={() => setShowTags((current) => !current)}>
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            Tags
          </button>
        </div>
        <div className="toolbar-group">
          <Link to="/issues/new" className="create-button">
            <Plus size={18} />
            NEW ISSUE
          </Link>
          <Link to="/issues/bulk-insert" className="icon-button" aria-label="Bulk insert issues">
            <ListPlus size={18} />
          </Link>
        </div>
      </div>

      <div className={`issues-layout ${filtersOpen ? 'is-filters-open' : ''}`}>
        {filtersOpen && (
          <aside className="filters-panel">
            <div className="filters-head">
              <h2>Filters</h2>
              <button type="button" onClick={clearFilters}>
                Clear all
              </button>
            </div>
            {filterKeys.map(({ key, label }) =>
              filterOptions[key].length ? (
                <section className="filter-group" key={key}>
                  <h3>{label}</h3>
                  {filterOptions[key].map((value) => (
                    <label className="filter-option" key={value}>
                      <input
                        type="checkbox"
                        checked={selectedFilters[key].includes(value)}
                        onChange={() => toggleFilter(key, value)}
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </section>
              ) : null
            )}
          </aside>
        )}

        <div className="issues-main">
          {loading && <div className="empty-state">Loading issues...</div>}
          {error && <div className="error-state">{error.message || 'Could not load issues.'}</div>}
          {!loading && visibleIssues.length === 0 && <div className="empty-state">No issues found.</div>}

          {visibleIssues.length > 0 && (
            <div className={`issues-list ${showTags ? '' : 'hide-tags'}`}>
              <div className="issues-list-head">
                {[
                  ['type', 'Type'],
                  ['severity', 'Severity'],
                  ['priority', 'Priority'],
                  ['issue', 'Issue'],
                  ['status', 'Status'],
                  ['modified', 'Modified'],
                  ['assigned', 'Assign To']
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    className={`issues-head-button issues-head-button--${key === 'issue' ? 'issue' : 'meta'}`}
                    onClick={() => toggleSort(key as SortKey)}
                  >
                    {label}
                    {sortKey === key && <span className={`sort-indicator is-${sortDirection}`} />}
                  </button>
                ))}
              </div>

              {visibleIssues.map((issue) => (
                <article
                  className={`issue-row ${issue.blocker ? 'issue-row--blocked' : ''}`}
                  key={issue.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => nav(`/issues/${issue.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') nav(`/issues/${issue.id}`)
                  }}
                >
                  <span className="issue-dot" style={{ '--dot-color': issue.type?.color || '#ec4661' } as React.CSSProperties} title={issue.type?.name || 'Type not set'} />
                  <span className="issue-dot" style={{ '--dot-color': issue.severity?.color || '#38d36c' } as React.CSSProperties} title={issue.severity?.name || 'Severity not set'} />
                  <span className="issue-dot" style={{ '--dot-color': issue.priority?.color || '#ead13a' } as React.CSSProperties} title={issue.priority?.name || 'Priority not set'} />

                  <div className="issue-summary">
                    <div className="issue-summary-main">
                      <span className="issue-id">#{issue.id}</span>
                      <span className="issue-title">{issue.title || 'Untitled issue'}</span>
                      {issue.blocker && (
                        <span className="issue-flag issue-flag--blocked" title={issue.blocker}>
                          <Lock size={14} />
                        </span>
                      )}
                      {issue.due_date && (
                        <span
                          className="issue-flag issue-flag--due"
                          style={{ '--due-color': resolveDueDateColor(issue, dueStatuses) } as React.CSSProperties}
                          title={`Due ${issue.due_date}`}
                        >
                          <Clock size={14} />
                        </span>
                      )}
                    </div>
                    <div className="issue-tags">
                      {issue.tags.map((tag) => (
                        <span className="issue-chip" key={tag.id} style={{ '--tag-color': tag.color || '#b4b0c4' } as React.CSSProperties}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="issue-status" style={{ '--status-color': issue.status?.color || '#47a5ef' } as React.CSSProperties}>
                    {issue.status?.name || 'New'}
                  </span>
                  <span className="issue-modified">{readableDate(issue.updated_at)}</span>
                  {canEditIssue(issue, currentUser) ? (
                    <button
                      type="button"
                      className="assignee-button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setAssigneeIssue(issue)
                        setAssigneeId(issue.assigned_to?.id ? String(issue.assigned_to.id) : '')
                      }}
                    >
                      <span className="app-avatar app-avatar--small">
                        {issue.assigned_to?.photo ? <img src={issue.assigned_to.photo} alt="" /> : initials(issue.assigned_to?.username)}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                  ) : (
                    <span className="assignee-button assignee-button--readonly" title="Only the issue creator can edit this issue">
                      <span className="app-avatar app-avatar--small">
                        {issue.assigned_to?.photo ? <img src={issue.assigned_to.photo} alt="" /> : initials(issue.assigned_to?.username)}
                      </span>
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {assigneeIssue && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="assignee-title">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Quick Edit</p>
                <h2 id="assignee-title">Change assignee</h2>
                <p>#{assigneeIssue.id} · {assigneeIssue.title}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setAssigneeIssue(null)}>
                x
              </button>
            </div>
            <label className="field">
              <span>Assignee</span>
              <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.username} {user.email ? `(${user.email})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setAssigneeIssue(null)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={saveAssignee} disabled={savingAssignee}>
                Save assignee
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default IssuesListPage
