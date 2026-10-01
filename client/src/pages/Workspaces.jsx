import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useWorkspaceStore from '../store/workspaceStore'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
const ICONS = ['📁', '🚀', '💡', '🎯', '🛠️', '📊', '🌐', '✨']

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', settings: { color: COLORS[0], icon: ICONS[0] } })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await onCreate(form)
    setLoading(false)
    if (res.success) onClose()
    else setError(res.message)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>New Workspace</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" placeholder="e.g. Product Design" required
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="What's this workspace for?"
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, settings: { ...p.settings, icon: ic } }))}
                  style={{ fontSize: '1.3rem', padding: '0.35rem 0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
                    border: form.settings.icon === ic ? '2px solid #6366f1' : '2px solid transparent',
                    background: form.settings.icon === ic ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                  }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, settings: { ...p.settings, color: c } }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.settings.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <><span className="spinner" /> Creating…</> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Workspaces() {
  const { workspaces, isLoading, fetchWorkspaces, createWorkspace } = useWorkspaceStore()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchWorkspaces() }, [])

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="topbar">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>Workspaces</div>
          <div style={{ fontWeight: 600 }}>All Workspaces</div>
        </div>
        <button id="create-workspace-btn" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Workspace</button>
      </div>

      <div className="page-content">
        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input className="form-input" placeholder="🔍  Search workspaces…" style={{ maxWidth: 340 }}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◈</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {search ? 'No workspaces match your search' : 'No workspaces yet'}
            </h3>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              {search ? 'Try a different keyword.' : 'Create your first workspace to get started.'}
            </p>
            {!search && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create workspace</button>}
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((ws) => (
              <Link key={ws._id} to={`/workspace/${ws._id}`} className="workspace-card">
                <div className="workspace-icon" style={{ background: `${ws.settings?.color || '#6366f1'}20` }}>
                  {ws.settings?.icon || '📁'}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{ws.name}</div>
                <div className="text-muted text-sm" style={{ marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ws.description || 'No description'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-primary">{ws.members?.length || 1} member{ws.members?.length !== 1 ? 's' : ''}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(ws.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal onClose={() => setShowModal(false)} onCreate={createWorkspace} />
      )}
    </div>
  )
}
