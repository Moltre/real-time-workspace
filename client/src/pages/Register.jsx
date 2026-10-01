import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Register() {
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleChange = (e) => {
    clearError()
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await register(form)
    if (res.success) navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '0.85rem', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
          }}>⚡</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>Create your account</h1>
          <p className="text-muted text-sm">Start collaborating in real-time, for free</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              name="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password <span className="text-muted text-sm">(min. 8 characters)</span>
            </label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            {isLoading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <div className="divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
