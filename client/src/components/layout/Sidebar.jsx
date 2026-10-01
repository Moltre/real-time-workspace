import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const navItems = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/workspaces', icon: '◈', label: 'Workspaces' },
  { to: '/settings',  icon: '⚙', label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/dashboard" className="sidebar-logo" style={{ textDecoration:'none' }}>
        <div className="logo-icon">⚡</div>
        <div>
          <div className="logo-text">CollabSpace</div>
          <div className="logo-tagline">Real-Time Workspace</div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User pill */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="user-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div className="user-email" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button className="nav-item btn-ghost" onClick={handleLogout} style={{ marginTop:'0.5rem' }}>
          <span className="nav-icon">⏏</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
