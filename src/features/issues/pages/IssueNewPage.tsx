import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { attachmentsApi } from '../../attachments/api/attachmentsApi'
import { settingsApi } from '../../settings/api/settingsApi'
import { usersApi } from '../../users/api/usersApi'
import { issuesApi } from '../api/issuesApi'
import { ApiUser, DueDateStatus, IssuePayload, IssueStatus, ReferenceItem } from '../types'

type ReferenceData = {
  types: ReferenceItem[]
  severities: ReferenceItem[]
  priorities: ReferenceItem[]
  statuses: IssueStatus[]
  tags: ReferenceItem[]
  dueStatuses: DueDateStatus[]
  users: ApiUser[]
}

const emptyRefs: ReferenceData = {
  types: [],
  severities: [],
  priorities: [],
  statuses: [],
  tags: [],
  dueStatuses: [],
  users: []
}

function firstId<T extends { id: number }>(items: T[]) {
  return items[0]?.id ? String(items[0].id) : ''
}

const IssueNewPage: React.FC = () => {
  const nav = useNavigate()
  const [refs, setRefs] = useState<ReferenceData>(emptyRefs)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [blocker, setBlocker] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [typeId, setTypeId] = useState('')
  const [severityId, setSeverityId] = useState('')
  const [priorityId, setPriorityId] = useState('')
  const [statusId, setStatusId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#c7cad4')
  const [newTags, setNewTags] = useState<Array<{ name: string; color: string }>>([])
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      settingsApi.list<ReferenceItem>('types'),
      settingsApi.list<ReferenceItem>('severities'),
      settingsApi.list<ReferenceItem>('priorities'),
      settingsApi.list<IssueStatus>('statuses'),
      settingsApi.list<ReferenceItem>('tags'),
      settingsApi.list<DueDateStatus>('due-date-statuses'),
      usersApi.list()
    ])
      .then(([types, severities, priorities, statuses, tags, dueStatuses, users]) => {
        setRefs({ types, severities, priorities, statuses, tags, dueStatuses, users })
        setTypeId(firstId(types))
        setSeverityId(firstId(severities))
        setPriorityId(firstId(priorities))
        const open = statuses.find((status) => status.name.toLowerCase() === 'open')
        setStatusId(open ? String(open.id) : firstId(statuses))
      })
      .catch((err) => setError(err.message || 'Could not load form data.'))
  }, [])

  const selectedTags = useMemo(() => refs.tags.filter((tag) => tagIds.includes(tag.id)), [refs.tags, tagIds])

  function toggleTag(id: number) {
    setTagIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function addNewTag() {
    const name = newTagName.trim()
    if (!name) return
    setNewTags((current) => [...current, { name, color: newTagColor }])
    setNewTagName('')
    setNewTagColor('#c7cad4')
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    const payload: IssuePayload = {
      title: title.trim(),
      description: description.trim(),
      blocker: blocker.trim() || null,
      due_date: dueDate || null,
      type_id: typeId ? Number(typeId) : null,
      severity_id: severityId ? Number(severityId) : null,
      priority_id: priorityId ? Number(priorityId) : null,
      status_id: statusId ? Number(statusId) : null,
      assigned_to_id: assignedToId ? Number(assignedToId) : null,
      tag_ids: tagIds,
      new_tags: newTags
    }

    setSaving(true)
    try {
      const issue = await issuesApi.create(payload)
      if (files.length > 0) {
        await attachmentsApi.upload(issue.id, files)
      }
      nav(`/issues/${issue.id}`)
    } catch (err: any) {
      setError(err.message || 'Could not create issue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-page">
      <form className="issue-editor" onSubmit={onSubmit}>
        <div className="modal-head">
          <h1>New issue</h1>
          <button type="button" className="close-button" onClick={() => nav('/issues')} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-state">{error}</div>}

        <div className="editor-grid">
          <div className="editor-main">
            <input
              className="title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Issue title"
              autoFocus
            />

            <div className="tag-editor">
              <div className="tag-row">
                {selectedTags.map((tag) => (
                  <button
                    type="button"
                    className="tag-chip"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    style={{ '--tag-color': tag.color } as React.CSSProperties}
                  >
                    {tag.name} x
                  </button>
                ))}
                {newTags.map((tag, index) => (
                  <button
                    type="button"
                    className="tag-chip"
                    key={`${tag.name}-${index}`}
                    onClick={() => setNewTags((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    style={{ '--tag-color': tag.color } as React.CSSProperties}
                  >
                    {tag.name} x
                  </button>
                ))}
                {selectedTags.length === 0 && newTags.length === 0 && <span className="muted">No tags selected</span>}
              </div>
              <div className="tag-controls">
                <select value="" onChange={(event) => event.target.value && toggleTag(Number(event.target.value))}>
                  <option value="">Add existing tag</option>
                  {refs.tags
                    .filter((tag) => !tagIds.includes(tag.id))
                    .map((tag) => (
                      <option value={tag.id} key={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
                <input value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="New tag name" />
                <input type="color" value={newTagColor} onChange={(event) => setNewTagColor(event.target.value)} />
                <button type="button" className="secondary-button" onClick={addNewTag}>
                  Add tag +
                </button>
              </div>
            </div>

            <textarea
              className="description-input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add details, reproduction steps, context, or leave blank"
            />

            <section className="attachments-box">
              <div className="section-head">
                <h2>{files.length} Attachment{files.length === 1 ? '' : 's'}</h2>
              </div>
              <label className="drop-zone">
                <input
                  type="file"
                  multiple
                  onChange={(event) => setFiles(Array.from(event.target.files || []))}
                  hidden
                />
                <span>{files.length ? files.map((file) => file.name).join(', ') : 'Choose files to upload after creation'}</span>
              </label>
            </section>
          </div>

          <aside className="editor-side">
            <label className="field">
              <span>Status</span>
              <select value={statusId} onChange={(event) => setStatusId(event.target.value)}>
                <option value="">No status</option>
                {refs.statuses.map((status) => (
                  <option value={status.id} key={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assigned</span>
              <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                <option value="">Unassigned</option>
                {refs.users.map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Type</span>
              <select value={typeId} onChange={(event) => setTypeId(event.target.value)}>
                {refs.types.map((type) => (
                  <option value={type.id} key={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Severity</span>
              <select value={severityId} onChange={(event) => setSeverityId(event.target.value)}>
                {refs.severities.map((severity) => (
                  <option value={severity.id} key={severity.id}>
                    {severity.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select value={priorityId} onChange={(event) => setPriorityId(event.target.value)}>
                {refs.priorities.map((priority) => (
                  <option value={priority.id} key={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>

            <label className="field">
              <span>Blocker</span>
              <input value={blocker} onChange={(event) => setBlocker(event.target.value)} placeholder="Blocker reason" />
            </label>
          </aside>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={() => nav('/issues')}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default IssueNewPage
