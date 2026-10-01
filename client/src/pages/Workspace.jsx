import { useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useWorkspaceStore from '../store/workspaceStore'
import useAuthStore from '../store/authStore'

const toolbarActions = [
  { label: 'B', title: 'Bold', style: { fontWeight: 700 } },
  { label: 'I', title: 'Italic', style: { fontStyle: 'italic' } },
  { label: 'U', title: 'Underline', style: { textDecoration: 'underline' } },
  { label: 'H1', title: 'Heading 1' },
  { label: 'H2', title: 'Heading 2' },
  { label: '≡', title: 'List' },
  { label: '⬚', title: 'Code block' },
  { label: '🔗', title: 'Link' },
]

export default function WorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeWorkspace, isLoading, fetchWorkspace, deleteWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()
  const editorRef = useRef(null)

  useEffect(() => { fetchWorkspace(id) }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Archive this workspace? It won\'t be permanently deleted.')) return
    const res = await deleteWorkspace(id)
    if (res.success) navigate('/workspaces')
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  )

  if (!activeWorkspace) return (
    <div className="page-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2>Workspace not found</h2>
      <Link to="/workspaces" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
        ← Back
      </Link>
    </div>
  )

  const ws = activeWorkspace
  const isOwner = ws.owner?._id === user?._id || ws.owner === user?._id

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/workspaces" className="btn btn-ghost btn-icon btn-sm" title="Back">←</Link>
          <span style={{ fontSize: '1.3rem' }}>{ws.settings?.icon || '📁'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{ws.name}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ws.description || 'No description'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Online presence (placeholder) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="presence-dot" />
            <span className="text-muted text-sm">1 online</span>
          </div>
          {isOwner && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Archive</button>
          )}
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── Editor ─────────────────────────────────────────────────────── */}
          <div className="workspace-editor">
            <div className="editor-toolbar">
              {toolbarActions.map(({ label, title, style }) => (
                <button key={label} title={title} className="btn btn-ghost btn-sm btn-icon"
                  style={{ fontFamily: 'monospace', ...style }}>
                  {label}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>● Auto-saved</span>
              </div>
            </div>
            <div
              ref={editorRef}
              className="editor-body"
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none', minHeight: 480 }}
              data-placeholder="Start typing to collaborate in real-time…"
            >
            </div>
          </div>

          {/* ── Info panel ────────────────────────────────────────────────── */}
          <div>
            {/* Members */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>👥 Members ({ws.members?.length || 1})</div>
              {(ws.members || []).map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{m.user?.name || 'Unknown'}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>ℹ️ Details</div>
              <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--color-text)' }}>Owner: </strong>
                {ws.owner?.name || 'Unknown'}
              </div>
              <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--color-text)' }}>Created: </strong>
                {new Date(ws.createdAt).toLocaleDateString()}
              </div>
              <div className="text-muted text-sm">
                <strong style={{ color: 'var(--color-text)' }}>Updated: </strong>
                {new Date(ws.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
