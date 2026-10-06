import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useWorkspaceStore from '../store/workspaceStore'
import useBoardStore from '../store/boardStore'
import useAuthStore from '../store/authStore'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

function CreateBoardModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] })
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
        <div className="modal-header">
          <h2>Create Board</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Board name *</label>
            <input className="form-input" placeholder="e.g. Product Roadmap" required
              value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="What is this board for?"
              value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.color===c ? '3px solid #fff':'3px solid transparent', cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating…</> : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BoardCard({ board, workspaceId, onDelete }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const { updateBoard } = useBoardStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(board.name)

  const handleRename = async (e) => {
    e.preventDefault()
    if (name.trim() && name !== board.name) {
      await updateBoard(board._id, workspaceId, { name: name.trim() })
    }
    setEditing(false)
  }

  return (
    <div className="board-card" style={{ '--board-color': board.color || '#6366f1' }}>
      <div className="board-card-header" onClick={() => !editing && navigate(`/board/${board._id}`)}>
        <div className="board-card-accent" />
        <div className="board-card-body">
          {editing ? (
            <form onSubmit={handleRename} onClick={e => e.stopPropagation()}>
              <input className="form-input" value={name} autoFocus
                onChange={e => setName(e.target.value)}
                onBlur={handleRename}
                style={{ fontSize:'0.95rem', padding:'0.35rem 0.6rem', marginBottom:'0.25rem' }} />
            </form>
          ) : (
            <div className="board-card-name">{board.name}</div>
          )}
          {board.description && (
            <div className="board-card-desc">{board.description}</div>
          )}
        </div>
        <button className="board-card-menu-btn"
          onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}>⋯</button>
      </div>

      {showMenu && (
        <div className="board-card-menu" onMouseLeave={() => setShowMenu(false)}>
          <button onClick={() => { setEditing(true); setShowMenu(false) }}>✏️ Rename</button>
          <button className="danger" onClick={() => { onDelete(board._id); setShowMenu(false) }}>🗑 Delete</button>
        </div>
      )}

      <div className="board-card-footer">
        <span className="text-muted text-sm">
          {new Date(board.createdAt).toLocaleDateString()}
        </span>
        <span className="badge badge-primary" style={{ fontSize:'0.7rem' }}>
          {board.createdBy?.name?.split(' ')[0] || 'You'}
        </span>
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeWorkspace, isLoading: wsLoading, fetchWorkspace, deleteWorkspace } = useWorkspaceStore()
  const { boards, isLoading: boardsLoading, fetchBoards, createBoard, deleteBoard } = useBoardStore()
  const { user } = useAuthStore()
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [tab, setTab] = useState('boards')

  useEffect(() => {
    fetchWorkspace(id)
    fetchBoards(id)
  }, [id])

  const wsBoards = boards[id] || []

  const handleDeleteWorkspace = async () => {
    if (!window.confirm('Archive this workspace?')) return
    const res = await deleteWorkspace(id)
    if (res.success) navigate('/workspaces')
  }

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Delete this board and all its cards?')) return
    deleteBoard(boardId, id)
  }

  if (wsLoading && !activeWorkspace) return (
    <div className="page-loader">
      <span className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
    </div>
  )

  if (!activeWorkspace) return (
    <div className="page-content" style={{ textAlign:'center', paddingTop:'4rem' }}>
      <h2>Workspace not found</h2>
      <Link to="/workspaces" className="btn btn-primary" style={{ marginTop:'1rem', display:'inline-flex' }}>← Back</Link>
    </div>
  )

  const ws = activeWorkspace
  const isOwner = ws.owner?._id === user?._id || ws.owner === user?._id

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div className="flex items-center gap-3">
          <Link to="/workspaces" className="btn btn-ghost btn-icon btn-sm" title="Back">←</Link>
          <span style={{ fontSize:'1.3rem' }}>{ws.settings?.icon || '📁'}</span>
          <div>
            <div style={{ fontWeight:600 }}>{ws.name}</div>
            <div className="text-muted" style={{ fontSize:'0.75rem' }}>{ws.description || 'No description'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button id="create-board-btn" className="btn btn-primary btn-sm" onClick={() => setShowCreateBoard(true)}>
            + New Board
          </button>
          {isOwner && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteWorkspace}>Archive</button>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="ws-tabs">
        {['boards','members','details'].map(t => (
          <button key={t} className={`ws-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="page-content">
        {/* ── Boards tab ──────────────────────────────────────────────── */}
        {tab === 'boards' && (
          <>
            {boardsLoading ? (
              <div className="boards-skeleton">
                {[1,2,3].map(i => <div key={i} className="board-card-skeleton" />)}
              </div>
            ) : wsBoards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No boards yet</h3>
                <p>Create your first board to start organising work into lists and cards.</p>
                <button className="btn btn-primary" onClick={() => setShowCreateBoard(true)}>
                  Create Board
                </button>
              </div>
            ) : (
              <div className="boards-grid">
                {wsBoards.map(board => (
                  <BoardCard key={board._id} board={board} workspaceId={id} onDelete={handleDeleteBoard} />
                ))}
                <button className="board-card add-board-card" onClick={() => setShowCreateBoard(true)}>
                  <span style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>+</span>
                  <span>Add Board</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Members tab ─────────────────────────────────────────────── */}
        {tab === 'members' && (
          <div style={{ maxWidth:560 }}>
            <div className="card">
              <div style={{ fontWeight:600, marginBottom:'1rem' }}>👥 Members ({ws.members?.length || 1})</div>
              {(ws.members || []).map((m, i) => (
                <div key={i} className="member-row">
                  <div className="user-avatar" style={{ width:36, height:36, fontSize:'0.85rem' }}>
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500 }}>{m.user?.name || 'Unknown'}</div>
                    <div className="text-muted text-sm">{m.user?.email}</div>
                  </div>
                  <span className="badge badge-primary">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Details tab ─────────────────────────────────────────────── */}
        {tab === 'details' && (
          <div style={{ maxWidth:560 }}>
            <div className="card">
              <div style={{ fontWeight:600, marginBottom:'1rem' }}>ℹ️ Workspace Details</div>
              <div className="text-muted text-sm" style={{ marginBottom:'0.5rem' }}>
                <strong style={{ color:'var(--color-text)' }}>Owner: </strong>{ws.owner?.name}
              </div>
              <div className="text-muted text-sm" style={{ marginBottom:'0.5rem' }}>
                <strong style={{ color:'var(--color-text)' }}>Created: </strong>
                {new Date(ws.createdAt).toLocaleDateString()}
              </div>
              <div className="text-muted text-sm">
                <strong style={{ color:'var(--color-text)' }}>Boards: </strong>{wsBoards.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={(data) => createBoard(id, data)}
        />
      )}
    </div>
  )
}
