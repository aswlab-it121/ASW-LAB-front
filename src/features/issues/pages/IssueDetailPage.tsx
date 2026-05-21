import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Paperclip, Trash2, X } from 'lucide-react'
import { getSelectedUser, useUserStore } from '../../../app/store/userStore'
import { activitiesApi } from '../../activities/api/activitiesApi'
import { attachmentsApi } from '../../attachments/api/attachmentsApi'
import { commentsApi } from '../../comments/api/commentsApi'
import { settingsApi } from '../../settings/api/settingsApi'
import { usersApi } from '../../users/api/usersApi'
import { profilePath } from '../../users/utils/profilePath'
import { watchersApi } from '../../watchers/api/watchersApi'
import { issuesApi } from '../api/issuesApi'
import { canDeleteAttachment, canDeleteComment, canDeleteIssue, canEditComment, canEditIssue } from '../../../lib/permissions'
import {
  ActivityLog,
  ApiUser,
  ApiUserBrief,
  DueDateStatus,
  Issue,
  IssueAttachment,
  IssueComment,
  IssuePayload,
  IssueStatus,
  ReferenceItem
} from '../types'

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function fileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function initials(user?: ApiUserBrief | null) {
  return (user?.username || 'UN').slice(0, 2).toUpperCase()
}

function activityActionText(activity: ActivityLog) {
  if (activity.action === 'created') return 'created this issue'
  if (activity.action === 'comment_added') return 'added a comment'
  if (activity.action === 'comment_edited') return 'edited a comment'
  if (activity.action === 'comment_deleted') return 'deleted a comment'
  if (activity.action === 'attachment_added') return `added attachment ${activity.new_value || ''}`
  if (activity.action === 'attachment_deleted') return `deleted attachment ${activity.old_value || ''}`
  if (activity.action === 'watcher_added') return `added ${activity.new_value || 'a watcher'} to watchers`
  if (activity.action === 'watcher_removed') return `removed ${activity.old_value || 'a watcher'} from watchers`
  if (activity.action === 'field_changed') {
    return `changed ${activity.field_name || 'a field'} from ${activity.old_value || 'empty'} to ${activity.new_value || 'empty'}`
  }
  return activity.action
}

const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams()
  const nav = useNavigate()
  const currentUser = getSelectedUser()
  const setEditingIssue = useUserStore((s) => s.setEditingIssue)
  const applyPendingSelection = useUserStore((s) => s.applyPendingSelection)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [refs, setRefs] = useState<ReferenceData>(emptyRefs)
  const [comments, setComments] = useState<IssueComment[]>([])
  const [attachments, setAttachments] = useState<IssueAttachment[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [watcherIds, setWatcherIds] = useState<number[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [tab, setTab] = useState<'comments' | 'activities'>('comments')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  const [tagQuery, setTagQuery] = useState('')
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [newTagColor, setNewTagColor] = useState('#c7cad4')
  const [newTags, setNewTags] = useState<Array<{ name: string; color: string }>>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [watcherToAdd, setWatcherToAdd] = useState('')
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null)
  const [initialAssignedToId, setInitialAssignedToId] = useState('')
  const [initialWatcherIds, setInitialWatcherIds] = useState<number[]>([])
  const [apiUserId, setApiUserId] = useState<number | null>(null)

  async function loadAll() {
    if (!issueId) return
    setLoading(true)
    setError(null)
    try {
      const [
        loadedIssue,
        apiMe,
        types,
        severities,
        priorities,
        statuses,
        tags,
        dueStatuses,
        users,
        loadedComments,
        loadedAttachments,
        loadedWatchers,
        loadedActivities
      ] = await Promise.all([
          issuesApi.get(issueId),
          usersApi.me(),
          settingsApi.list<ReferenceItem>('types'),
          settingsApi.list<ReferenceItem>('severities'),
          settingsApi.list<ReferenceItem>('priorities'),
          settingsApi.list<IssueStatus>('statuses'),
          settingsApi.list<ReferenceItem>('tags'),
          settingsApi.list<DueDateStatus>('due-date-statuses'),
          usersApi.list(),
          commentsApi.list(issueId),
          attachmentsApi.list(issueId),
          watchersApi.list(issueId),
          activitiesApi.list(issueId)
        ])
      setApiUserId(apiMe.id)
      setIssue(loadedIssue)
      setRefs({ types, severities, priorities, statuses, tags, dueStatuses, users })
      setComments(loadedComments)
      setAttachments(loadedAttachments)
      setWatcherIds(loadedWatchers.map((watcher) => watcher.id))
      setActivities(loadedActivities)
      setTitle(loadedIssue.title || '')
      setDescription(loadedIssue.description || '')
      setBlocker(loadedIssue.blocker || '')
      setDueDate(loadedIssue.due_date || '')
      setTypeId(loadedIssue.type?.id ? String(loadedIssue.type.id) : '')
      setSeverityId(loadedIssue.severity?.id ? String(loadedIssue.severity.id) : '')
      setPriorityId(loadedIssue.priority?.id ? String(loadedIssue.priority.id) : '')
      setStatusId(loadedIssue.status?.id ? String(loadedIssue.status.id) : '')
      setAssignedToId(loadedIssue.assigned_to?.id ? String(loadedIssue.assigned_to.id) : '')
      setInitialAssignedToId(loadedIssue.assigned_to?.id ? String(loadedIssue.assigned_to.id) : '')
      setInitialWatcherIds(loadedWatchers.map((watcher) => watcher.id).sort((a, b) => a - b))
      setTagIds(loadedIssue.tags.map((tag) => tag.id))
      setNewTags([])
    } catch (err: any) {
      setError(err.message || 'Could not load issue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId])

  useEffect(() => {
    setEditingIssue(true)
    return () => setEditingIssue(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const editable = useMemo(
    () => (issue ? canEditIssue(issue, currentUser, apiUserId) : false),
    [issue, currentUser, apiUserId]
  )
  const selectedTags = useMemo(() => refs.tags.filter((tag) => tagIds.includes(tag.id)), [refs.tags, tagIds])
  const availableTags = useMemo(() => refs.tags.filter((tag) => !tagIds.includes(tag.id)), [refs.tags, tagIds])
  const recommendedTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase()
    if (!query) return availableTags
    return availableTags.filter((tag) => tag.name.toLowerCase().includes(query))
  }, [availableTags, tagQuery])
  const visibleWatchers = useMemo(
    () => refs.users.filter((user) => watcherIds.includes(user.id)),
    [refs.users, watcherIds]
  )
  const availableWatchers = useMemo(
    () => refs.users.filter((user) => !watcherIds.includes(user.id)),
    [refs.users, watcherIds]
  )

  useEffect(() => {
    if (!editable) {
      setTagPickerOpen(false)
      setTagQuery('')
      setNewTagColor('#c7cad4')
    }
  }, [editable])

  function toggleTag(id: number) {
    setTagIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function closeTagPicker() {
    setTagPickerOpen(false)
    setTagQuery('')
    setNewTagColor('#c7cad4')
  }

  function addNewTag(name: string) {
    if (!name) return
    setNewTags((current) => [...current, { name, color: newTagColor }])
  }

  function commitTagSelection() {
    const query = tagQuery.trim()
    if (!query || !editable) return
    const normalizedQuery = query.toLowerCase()
    const exactMatch = availableTags.find((tag) => tag.name.toLowerCase() === normalizedQuery)
    if (exactMatch) {
      toggleTag(exactMatch.id)
      closeTagPicker()
      return
    }
    if (recommendedTags.length > 0) {
      toggleTag(recommendedTags[0].id)
      closeTagPicker()
      return
    }
    addNewTag(query)
    closeTagPicker()
  }

  function selectRecommendedTag(id: number) {
    if (!editable) return
    toggleTag(id)
    closeTagPicker()
  }

  function onTagQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    commitTagSelection()
  }

  async function saveIssue(event: React.FormEvent) {
    event.preventDefault()
    if (!issue) return
    setError(null)
    const sortedWatcherIds = [...watcherIds].sort((a, b) => a - b)
    const watcherChanged =
      sortedWatcherIds.length !== initialWatcherIds.length ||
      sortedWatcherIds.some((id, index) => id !== initialWatcherIds[index])
    const assigneeChanged = assignedToId !== initialAssignedToId
    const loadedTagIds = issue.tags.map((tag) => tag.id).sort((a, b) => a - b)
    const currentTagIds = [...tagIds].sort((a, b) => a - b)
    const tagsChanged =
      loadedTagIds.length !== currentTagIds.length ||
      loadedTagIds.some((id, index) => id !== currentTagIds[index])
    const coreFieldsChanged =
      editable &&
      (title.trim() !== (issue.title || '').trim() ||
        description.trim() !== (issue.description || '').trim() ||
        (blocker.trim() || null) !== (issue.blocker || null) ||
        (dueDate || null) !== (issue.due_date || null) ||
        (typeId || '') !== (issue.type?.id ? String(issue.type.id) : '') ||
        (severityId || '') !== (issue.severity?.id ? String(issue.severity.id) : '') ||
        (priorityId || '') !== (issue.priority?.id ? String(issue.priority.id) : '') ||
        (statusId || '') !== (issue.status?.id ? String(issue.status.id) : '') ||
        tagsChanged ||
        newTags.length > 0)
    const hasPendingAttachments = pendingFiles.length > 0
    const shouldUpdateIssue = coreFieldsChanged || assigneeChanged || watcherChanged

    if (!shouldUpdateIssue && !hasPendingAttachments) {
      nav('/issues')
      return
    }

    setSaving(true)
    try {
      if (shouldUpdateIssue) {
        let payload: IssuePayload
        if (editable) {
          payload = {
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
            new_tags: newTags,
            watcher_ids: watcherIds
          }
        } else {
          payload = {
            assigned_to_id: assignedToId ? Number(assignedToId) : null,
            watcher_ids: watcherIds
          } as IssuePayload
        }
        await issuesApi.update(issue.id, payload)
      }
      if (hasPendingAttachments) {
        await attachmentsApi.upload(issue.id, pendingFiles)
        setPendingFiles([])
      }
      applyPendingSelection()
      nav('/issues')
    } catch (err: any) {
      setError(err.message || 'Could not save issue.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteIssue() {
    if (!issue || !window.confirm(`Delete issue #${issue.id}?`)) return
    await issuesApi.delete(issue.id)
    nav('/issues')
  }

  async function postComment(event: React.FormEvent) {
    event.preventDefault()
    if (!issue || !commentDraft.trim()) return
    await commentsApi.create(issue.id, commentDraft.trim())
    setCommentDraft('')
    await loadAll()
  }

  async function saveComment(commentId: number) {
    if (!issue || !editingCommentText.trim()) return
    await commentsApi.update(issue.id, commentId, editingCommentText.trim())
    setEditingCommentId(null)
    setEditingCommentText('')
    await loadAll()
  }

  async function deleteComment(commentId: number) {
    if (!issue) return
    await commentsApi.delete(issue.id, commentId)
    await loadAll()
  }

  function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setPendingFiles((current) => [...current, ...Array.from(files)])
  }

  function removePendingFile(index: number) {
    setPendingFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  function openAttachmentPicker() {
    const input = attachmentsInputRef.current
    if (!input || saving) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }
    input.click()
  }

  async function deleteAttachment(attachmentId: number) {
    if (!issue) return
    const attachment = attachments.find((item) => item.id === attachmentId)
    if (attachment && !canDeleteAttachment(attachment, currentUser, issue, apiUserId)) return
    if (!window.confirm('Delete this attachment?')) return
    setError(null)
    try {
      await attachmentsApi.delete(issue.id, attachmentId)
      setAttachments((current) => current.filter((item) => item.id !== attachmentId))
    } catch (err: any) {
      setError(err.message || 'Could not delete attachment.')
    }
  }

  async function addWatcher(userId: string) {
    if (!userId) return
    const watcherId = Number(userId)
    if (!Number.isFinite(watcherId)) return
    setWatcherIds((current) => (current.includes(watcherId) ? current : [...current, watcherId]))
    setWatcherToAdd('')
  }

  async function removeWatcher(userId: number) {
    setWatcherIds((current) => current.filter((id) => id !== userId))
  }

  if (loading) return <div className="empty-state">Loading issue...</div>
  if (error) return <div className="error-state">{error}</div>
  if (!issue) return <div className="empty-state">Issue not found.</div>

  return (
    <div className="modal-page">
      <form className="issue-editor" onSubmit={saveIssue}>
        <div className="modal-head">
          <h1>Issue #{issue.id}</h1>
          <button type="button" className="close-button" onClick={() => nav('/issues')} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="editor-grid">
          <div className="editor-main">
            <input className="title-input" value={title} onChange={(event) => setTitle(event.target.value)} disabled={!editable} />

            <div className="tag-editor">
              <div className="tag-row">
                {selectedTags.map((tag) => (
                  <button
                    type="button"
                    className="tag-chip"
                    key={tag.id}
                    onClick={() => editable && toggleTag(tag.id)}
                    disabled={!editable}
                    style={{ '--tag-color': tag.color } as React.CSSProperties}
                  >
                    {tag.name} {editable ? 'x' : ''}
                  </button>
                ))}
                {newTags.map((tag, index) => (
                  <button
                    type="button"
                    className="tag-chip"
                    key={`${tag.name}-${index}`}
                    onClick={() => editable && setNewTags((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    disabled={!editable}
                    style={{ '--tag-color': tag.color } as React.CSSProperties}
                  >
                    {tag.name} {editable ? 'x' : ''}
                  </button>
                ))}
                {selectedTags.length === 0 && newTags.length === 0 && <span className="muted">No tags selected</span>}
                {editable && !tagPickerOpen && (
                  <button type="button" className="secondary-button tag-add-trigger" onClick={() => setTagPickerOpen(true)}>
                    Add tag +
                  </button>
                )}
              </div>
              {editable && (
                <>
                  {tagPickerOpen && (
                    <div className="tag-mini-bar">
                      <div className="tag-mini-input-row">
                        <input
                          value={tagQuery}
                          onChange={(event) => setTagQuery(event.target.value)}
                          onKeyDown={onTagQueryKeyDown}
                          placeholder="Search or create a tag"
                          autoFocus
                        />
                        <input type="color" value={newTagColor} onChange={(event) => setNewTagColor(event.target.value)} aria-label="Tag color" />
                        <button type="button" className="icon-button" onClick={closeTagPicker} aria-label="Cancel tag add">
                          <X size={16} />
                        </button>
                      </div>
                      <ul className="tag-recommendations" aria-label="Tag recommendations">
                        {recommendedTags.map((tag) => (
                          <li className="tag-recommendation" key={tag.id}>
                            <button type="button" className="tag-recommendation-button" onClick={() => selectRecommendedTag(tag.id)}>
                              <span>{tag.name}</span>
                            </button>
                          </li>
                        ))}
                        {tagQuery.trim() && recommendedTags.length === 0 && (
                          <li className="tag-recommendation tag-create-hint">
                            <span>Create &quot;{tagQuery.trim()}&quot; (press Enter)</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <textarea className="description-input" value={description} onChange={(event) => setDescription(event.target.value)} disabled={!editable} />

            <section className="attachments-box">
              <div className="section-head">
                <h2>{attachments.length + pendingFiles.length} Attachment{attachments.length + pendingFiles.length === 1 ? '' : 's'}</h2>
                <input
                  ref={attachmentsInputRef}
                  type="file"
                  multiple
                  hidden
                  disabled={saving}
                  onChange={(event) => {
                    uploadFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
                <button
                  type="button"
                  className="secondary-button file-button"
                  disabled={saving}
                  onClick={openAttachmentPicker}
                >
                  + Add file{pendingFiles.length > 0 ? ` (${pendingFiles.length} pending)` : ''}
                </button>
              </div>
              <p className="muted attachments-hint">You can delete only attachments you uploaded, on any issue.</p>
              {pendingFiles.length > 0 && (
                <div className="pending-uploads-panel" aria-live="polite">
                  <p className="pending-uploads-note">
                    {pendingFiles.length} file{pendingFiles.length === 1 ? '' : 's'} selected and queued for upload.
                  </p>
                  <ul className="attachment-list">
                    {pendingFiles.map((file, index) => (
                      <li className="attachment-item attachment-item--pending" key={`${file.name}-${file.size}-${index}`}>
                        <Paperclip size={16} />
                        <div>
                          <span>
                            {file.name} <span className="pending-badge">Pending</span>
                          </span>
                          <p>
                            {fileSize(file.size)} · will upload when you save
                          </p>
                        </div>
                        <button type="button" className="icon-danger" onClick={() => removePendingFile(index)} aria-label="Remove pending attachment">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {attachments.length === 0 && pendingFiles.length === 0 ? (
                <p className="muted">No attachments yet.</p>
              ) : (
                attachments.length > 0 && (
                  <ul className="attachment-list">
                    {attachments.map((attachment) => (
                      <li className="attachment-item" key={attachment.id}>
                        <Paperclip size={16} />
                        <div>
                          {attachment.url ? (
                            <a href={attachment.url} target="_blank" rel="noreferrer">
                              {attachment.original_name}
                            </a>
                          ) : (
                            <span>{attachment.original_name}</span>
                          )}
                          <p>
                            {fileSize(attachment.size)} · uploaded by{' '}
                            {attachment.owner ? (
                              <Link className="user-profile-link" to={profilePath(attachment.owner, currentUser?.id)}>
                                {attachment.owner.username}
                              </Link>
                            ) : (
                              'unknown'
                            )}{' '}
                            · {formatDate(attachment.created_at)}
                          </p>
                        </div>
                        {canDeleteAttachment(attachment, currentUser, issue, apiUserId) && (
                          <button
                            type="button"
                            className="icon-danger"
                            disabled={saving}
                            onClick={() => deleteAttachment(attachment.id)}
                            aria-label={`Delete attachment ${attachment.original_name}`}
                            title="Delete attachment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          </div>

          <aside className="editor-side">
            <label className="field">
              <span>Status</span>
              <select value={statusId} onChange={(event) => setStatusId(event.target.value)} disabled={!editable}>
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
              <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)} disabled={saving}>
                <option value="">Unassigned</option>
                {refs.users.map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </label>

            <section className="property-section">
              <span>Watchers</span>
              <div className="watchers-display">
                {visibleWatchers.length === 0 && <span className="muted">No watchers</span>}
                {visibleWatchers.map((watcher) => (
                  <span className="watcher-chip watcher-chip--linked" key={watcher.id}>
                    <Link to={profilePath(watcher, currentUser?.id)}>{watcher.username}</Link>
                    <button
                      type="button"
                      onClick={() => removeWatcher(watcher.id)}
                      aria-label={`Remove ${watcher.username} from watchers`}
                      disabled={saving}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div className="inline-row">
                <select value={watcherToAdd} onChange={(event) => setWatcherToAdd(event.target.value)} disabled={saving}>
                  <option value="">Add watcher</option>
                  {availableWatchers.map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                <button type="button" className="secondary-button" onClick={() => addWatcher(watcherToAdd)} disabled={saving}>
                  Add
                </button>
              </div>
            </section>

            <label className="field">
              <span>Type</span>
              <select value={typeId} onChange={(event) => setTypeId(event.target.value)} disabled={!editable}>
                {refs.types.map((type) => (
                  <option value={type.id} key={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Severity</span>
              <select value={severityId} onChange={(event) => setSeverityId(event.target.value)} disabled={!editable}>
                {refs.severities.map((severity) => (
                  <option value={severity.id} key={severity.id}>
                    {severity.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select value={priorityId} onChange={(event) => setPriorityId(event.target.value)} disabled={!editable}>
                {refs.priorities.map((priority) => (
                  <option value={priority.id} key={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={!editable} />
            </label>

            <label className="field">
              <span>Blocker</span>
              <input value={blocker} onChange={(event) => setBlocker(event.target.value)} disabled={!editable} />
            </label>
          </aside>
        </div>

        <div className="modal-actions">
          <Link to="/issues" className="secondary-button">
            Back to issues
          </Link>
          {canDeleteIssue(issue, currentUser, apiUserId) && (
            <button type="button" className="danger-button" onClick={deleteIssue}>
              Delete
            </button>
          )}
          <button type="submit" className="primary-button" disabled={saving}>
            {saving
              ? 'Saving...'
              : pendingFiles.length > 0
                ? `Save changes (${pendingFiles.length} file${pendingFiles.length === 1 ? '' : 's'} pending)`
                : 'Save changes'}
          </button>
        </div>
      </form>

      <section className="detail-tabs">
        <div className="tab-list">
          <button type="button" className={tab === 'comments' ? 'is-active' : ''} onClick={() => setTab('comments')}>
            Comments <span>{comments.length}</span>
          </button>
          <button type="button" className={tab === 'activities' ? 'is-active' : ''} onClick={() => setTab('activities')}>
            Activities <span>{activities.length}</span>
          </button>
        </div>

        {tab === 'comments' ? (
          <div className="comments-panel">
            <form className="comment-form" onSubmit={postComment}>
              <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Type a new comment here" />
              <button type="submit" className="primary-button">
                Post
              </button>
            </form>
            {comments.length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : (
              <ul className="comments-list">
                {comments.map((comment) => (
                  <li className="comment-item" key={comment.id}>
                    {comment.user ? (
                      <Link className="app-avatar profile-avatar-link" to={profilePath(comment.user, currentUser?.id)} aria-label={`View ${comment.user.username} profile`}>
                        {comment.user.photo ? <img src={comment.user.photo} alt="" /> : initials(comment.user)}
                      </Link>
                    ) : (
                      <span className="app-avatar">{initials(comment.user)}</span>
                    )}
                    <div className="comment-body">
                      <div className="comment-meta">
                        <strong>
                          {comment.user ? (
                            <Link className="user-profile-link" to={profilePath(comment.user, currentUser?.id)}>
                              {comment.user.username}
                            </Link>
                          ) : (
                            'Unknown user'
                          )}
                        </strong>
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="comment-edit">
                          <textarea value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} />
                          <button type="button" className="primary-button" onClick={() => saveComment(comment.id)}>
                            Save
                          </button>
                          <button type="button" className="secondary-button" onClick={() => setEditingCommentId(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p>{comment.comment}</p>
                      )}
                    </div>
                    {canEditComment(comment, currentUser, apiUserId) && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setEditingCommentId(comment.id)
                          setEditingCommentText(comment.comment)
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canDeleteComment(comment, currentUser, apiUserId) && (
                      <button type="button" className="icon-danger" onClick={() => deleteComment(comment.id)} aria-label="Delete comment">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="activity-panel">
            {activities.length === 0 ? (
              <p className="muted">No activity recorded yet.</p>
            ) : (
              <ul className="activity-list">
                {activities.map((activity) => (
                  <li className="activity-item" key={activity.id}>
                    {activity.user ? (
                      <Link className="app-avatar app-avatar--small profile-avatar-link" to={profilePath(activity.user, currentUser?.id)} aria-label={`View ${activity.user.username} profile`}>
                        {activity.user.photo ? <img src={activity.user.photo} alt="" /> : initials(activity.user)}
                      </Link>
                    ) : (
                      <span className="app-avatar app-avatar--small">{initials(activity.user)}</span>
                    )}
                    <div>
                      <p>
                        {activity.user ? (
                          <Link className="user-profile-link" to={profilePath(activity.user, currentUser?.id)}>
                            {activity.user.username}
                          </Link>
                        ) : (
                          'Someone'
                        )}{' '}
                        {activityActionText(activity)}
                      </p>
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default IssueDetailPage
