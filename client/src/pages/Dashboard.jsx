import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useWorkspaceStore from '../store/workspaceStore'

const stats = (workspaces) => [
  { icon: '◈', label: 'Workspaces', value: workspaces.length, bg: 'rgba(99,102,241,0.15)', color: '#6366f1' },
  { icon: '👥', label: 'Members',   value: workspaces.reduce((a, w) => a + (w.members?.length || 0), 0), bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  { icon: '⚡', label: 'Active',    value: workspaces.filter((w) => !w.isArchived).length, bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  { icon: '📅', label: 'This week', value: workspaces.filter((w) => {
      const d = new Date(w.createdAt)
      const now = new Date()
      return (now - d) / (1000 * 60 * 60 * 24) <= 7
    }).length, bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const { workspaces, isLoading, fetchWorkspaces } = useWorkspaceStore()

  useEffect(() => { fetchWorkspaces() }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>Dashboard</div>
          <div style={{ fontWeight: 600 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</div>
        </div>
        <Link to="/workspaces" className="btn btn-primary btn-sm">+ New Workspace</Link>
      </div>

      <div className="page-content">
        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {stats(workspaces).map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent workspaces */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Workspaces</h2>
          <Link to="/workspaces" className="link text-sm">View all →</Link>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◈</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No workspaces yet</h3>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Create your first workspace to start collaborating.</p>
            <Link to="/workspaces" className="btn btn-primary">Create workspace</Link>
          </div>
        ) : (
          <div className="grid-3">
            {workspaces.slice(0, 6).map((ws) => (
              <Link key={ws._id} to={`/workspace/${ws._id}`} className="workspace-card">
                <div className="workspace-icon" style={{ background: ws.settings?.color ? `${ws.settings.color}20` : 'rgba(99,102,241,0.1)' }}>
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
    </div>
  )
}
