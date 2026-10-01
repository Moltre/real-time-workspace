import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function Settings() {
  const { user, logout, initAuth } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg, setMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      await api.put('/users/profile', { name: form.name, avatar: form.avatar })
      await initAuth()
      setMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' })
    } finally { setSaving(false) }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div>
      <div className="topbar">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>Settings</div>
          <div style={{ fontWeight: 600 }}>Account Settings</div>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 680 }}>

        {/* ── Profile section ─────────────────────────────────────────────── */}
        <div className="settings-section">
          <div className="settings-section-title">Profile</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="user-avatar" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div className="text-muted text-sm">{user?.email}</div>
              <div style={{ marginTop: '0.3rem' }}>
                <span className="badge badge-primary">{user?.role}</span>
              </div>
            </div>
          </div>

          {msg && (
            <div className={`alert alert-${msg.type}`}><span>{msg.type === 'success' ? '✓' : '⚠'}</span> {msg.text}</div>
          )}

          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Display name</label>
              <input id="settings-name" className="form-input" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-avatar">Avatar URL</label>
              <input id="settings-avatar" className="form-input" placeholder="https://…" value={form.avatar}
                onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">Email address</label>
              <input id="settings-email" className="form-input" value={user?.email || ''} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <button id="save-profile-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}
            </button>
          </form>
        </div>

        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Dark mode</div>
              <div className="text-muted text-sm">Always on – designed for dark environments</div>
            </div>
            <div style={{
              width: 48, height: 26, borderRadius: 13,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              position: 'relative', cursor: 'default',
            }}>
              <div style={{
                position: 'absolute', right: 3, top: 3,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
              }} />
            </div>
          </div>
        </div>

        {/* ── Danger zone ─────────────────────────────────────────────────── */}
        <div className="settings-section" style={{ borderColor: 'rgba(239,68,68,0.25)' }}>
          <div className="settings-section-title" style={{ color: 'var(--color-danger)' }}>Danger Zone</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Sign out</div>
              <div className="text-muted text-sm">Sign out of your account on this device</div>
            </div>
            <button id="settings-logout-btn" className="btn btn-danger" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
