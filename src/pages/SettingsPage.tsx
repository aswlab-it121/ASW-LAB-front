import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X, GripVertical } from 'lucide-react'
import { SettingsEntity, SettingsItem, settingsApi } from '../features/settings/api/settingsApi'
import { DueDateStatus, IssueStatus } from '../features/issues/types'

type SectionConfig = {
  key: SettingsEntity
  label: string
  title: string
  description: string
}

const sections: SectionConfig[] = [
  {
    key: 'statuses',
    label: 'STATUSES',
    title: 'Statuses',
    description: 'Add, remove or edit the color and name of the statuses your issues will go through.'
  },
  { key: 'priorities', label: 'PRIORITIES', title: 'Priorities', description: 'Manage issue priorities and their order.' },
  { key: 'severities', label: 'SEVERITIES', title: 'Severities', description: 'Manage severity levels used to classify impact.' },
  { key: 'types', label: 'TYPES', title: 'Types', description: 'Define the available issue types for your workflow.' },
  { key: 'tags', label: 'TAGS', title: 'Tags', description: 'Configure tags to better organize and filter issues.' },
  {
    key: 'due-date-statuses',
    label: 'DUE DATES',
    title: 'Due Dates',
    description: 'Configure due date states and related defaults.'
  }
]

function isStatus(item: SettingsItem): item is IssueStatus {
  return 'is_closed' in item && !('days' in item)
}

function isDueDate(item: SettingsItem): item is DueDateStatus {
  return 'days' in item || 'timing' in item
}

const SettingsPage: React.FC = () => {
  const [active, setActive] = useState<SettingsEntity>('statuses')
  const [items, setItems] = useState<SettingsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    color: '#c7cad4',
    is_closed: false,
    days: '',
    timing: 'before' as 'before' | 'after',
    is_default: false
  })

  const section = useMemo(() => sections.find((item) => item.key === active) || sections[0], [active])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setMessage(null)
    try {
      setItems(await settingsApi.list(active))
    } catch (err: any) {
      setMessage(err.message || 'Could not load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditingId(null)
    setShowAdd(false)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  function resetForm() {
    setForm({ name: '', color: '#c7cad4', is_closed: false, days: '', timing: 'before', is_default: false })
  }

  function beginEdit(item: SettingsItem) {
    setEditingId(item.id)
    setShowAdd(false)
    setForm({
      name: item.name,
      color: item.color || '#c7cad4',
      is_closed: isStatus(item) ? item.is_closed : false,
      days: isDueDate(item) && item.days != null ? String(item.days) : '',
      timing: isDueDate(item) && item.timing ? item.timing : 'before',
      is_default: isDueDate(item) ? item.is_default : false
    })
  }

  function payload(order?: number) {
    const base: any = {
      name: form.name.trim(),
      color: form.color,
      ...(order !== undefined ? { order } : {})
    }
    if (active === 'statuses') base.is_closed = form.is_closed
    if (active === 'due-date-statuses') {
      base.days = form.days === '' ? null : Number(form.days)
      base.timing = form.days === '' ? null : form.timing
      base.is_default = form.is_default
    }
    return base
  }

  async function saveNew() {
    if (!form.name.trim()) return
    await settingsApi.create(active, payload(items.length + 1))
    resetForm()
    setShowAdd(false)
    await load()
  }

  async function saveEdit(item: SettingsItem) {
    if (!form.name.trim()) return
    await settingsApi.update(active, item.id, payload(item.order))
    setEditingId(null)
    resetForm()
    await load()
  }

  async function deleteItem(item: SettingsItem) {
    if (isDueDate(item) && item.is_default) {
      setMessage('The default due date status cannot be deleted.')
      return
    }
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      await settingsApi.delete(active, item.id)
      await load()
    } catch (err: any) {
      setMessage(err.message || 'Could not delete item.')
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    setItems(next)
    await Promise.all(next.map((item, itemIndex) => settingsApi.update(active, item.id, { order: itemIndex + 1 })))
    await load()
  }

  function renderEditor(item?: SettingsItem) {
    const editing = Boolean(item)
    return (
      <tr className="settings-inline-row">
        <td className="drag-cell">
          <span className="drag-cell-icon">
            <GripVertical size={16} />
          </span>
        </td>
        <td>
          <input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
        </td>
        <td>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" />
        </td>
        {active === 'statuses' && (
          <td>
            <input
              type="checkbox"
              checked={form.is_closed}
              onChange={(event) => setForm((current) => ({ ...current, is_closed: event.target.checked }))}
            />
          </td>
        )}
        {active === 'due-date-statuses' && (
          <>
            <td>
              <input
                type="number"
                min="0"
                value={form.days}
                onChange={(event) => setForm((current) => ({ ...current, days: event.target.value }))}
                placeholder="Days"
                disabled={form.is_default}
              />
            </td>
            <td>
              <select
                value={form.timing}
                onChange={(event) => setForm((current) => ({ ...current, timing: event.target.value as 'before' | 'after' }))}
                disabled={form.is_default}
              >
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
            </td>
          </>
        )}
        <td>
          <div className="settings-actions">
            <button type="button" className="settings-icon-btn is-accept" onClick={() => (editing && item ? saveEdit(item) : saveNew())}>
              <Check size={16} />
            </button>
            <button
              type="button"
              className="settings-icon-btn is-cancel"
              onClick={() => {
                setEditingId(null)
                setShowAdd(false)
                resetForm()
              }}
            >
              <X size={16} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <section className="settings-layout">
      <aside className="settings-sidebar">
        {/* Back button removed as requested */}
        {sections.map((item) => (
          <button
            type="button"
            className={`settings-nav-item ${item.key === active ? 'is-active' : ''}`}
            key={item.key}
            onClick={() => setActive(item.key)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <div className="settings-content">
        <h1>{section.title}</h1>
        <div className="settings-description-row">
          <p className="settings-description">{section.description}</p>
          <button
            type="button"
            className="settings-action"
            onClick={() => {
              resetForm()
              setEditingId(null)
              setShowAdd(true)
            }}
          >
            <Plus size={15} /> ADD NEW
          </button>
        </div>
        {message && <div className="settings-message">{message}</div>}

        <section className="settings-section">
          {/* Per-list title removed; Add button moved next to description above */}

          {loading ? (
            <div className="empty-state">Loading settings...</div>
          ) : (
            <table className="settings-table">
            <thead>
                <tr>
                  <th>Order</th>
                  <th>Color</th>
                  <th>Name</th>
                  {active === 'statuses' && <th>Is closed?</th>}
                  {active === 'due-date-statuses' && (
                    <>
                      <th>Days until due</th>
                      <th>Before/After</th>
                    </>
                  )}
                  <th />
                </tr>
              </thead>
            <tbody>
                {showAdd && renderEditor()}
                {items.map((item, index) =>
                  editingId === item.id ? (
                    renderEditor(item)
                  ) : (
                    <tr
                      key={item.id}
                      draggable={!(isDueDate(item) && item.is_default)}
                      onDragStart={(e) => {
                        e.dataTransfer?.setData('text/plain', String(index))
                        setDragIndex(index)
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault()
                        const from = dragIndex
                        const to = index
                        if (from == null || from === to) return
                        const next = [...items]
                        const [moved] = next.splice(from, 1)
                        next.splice(to, 0, moved)
                        setItems(next)
                        try {
                          await Promise.all(next.map((it, itemIndex) => settingsApi.update(active, it.id, { order: itemIndex + 1 })))
                          await load()
                        } catch (err: any) {
                          setMessage(err.message || 'Could not persist order.')
                        }
                      }}
                    >
                      <td className="settings-order">
                        <button type="button" className="settings-drag-handle" aria-label={`Drag ${item.name}`}>
                          <GripVertical size={16} />
                        </button>
                      </td>
                      <td>
                        <span className="settings-color-swatch" style={{ backgroundColor: item.color }} />
                      </td>
                      <td>{item.name}</td>
                      {active === 'statuses' && <td>{isStatus(item) && item.is_closed ? 'Yes' : 'No'}</td>}
                      {active === 'due-date-statuses' && isDueDate(item) && (
                        <>
                          <td>{item.days ?? ''}</td>
                          <td>{item.timing || (item.is_default ? 'Default' : '')}</td>
                        </>
                      )}
                      <td>
                        <div className="settings-actions">
                          <button type="button" className="settings-icon-btn" onClick={() => beginEdit(item)} disabled={isDueDate(item) && item.is_default}>
                            <Pencil size={16} />
                          </button>
                          <button type="button" className="settings-icon-btn is-danger" onClick={() => deleteItem(item)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
                {items.length === 0 && !showAdd && (
                  <tr>
                    <td colSpan={active === 'due-date-statuses' ? 6 : active === 'statuses' ? 5 : 4} className="settings-empty">
                      No values yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </section>
  )
}

export default SettingsPage
