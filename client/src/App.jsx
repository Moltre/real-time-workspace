import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Layout
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Workspaces from './pages/Workspaces'
import Workspace from './pages/Workspace'
import Board from './pages/Board'
import Settings from './pages/Settings'

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* App shell with sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspaces" element={<Workspaces />} />
            <Route path="/workspace/:id" element={<Workspace />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          {/* Board page – full screen, no sidebar */}
          <Route path="/board/:boardId" element={<Board />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
