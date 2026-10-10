import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

export function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-milk-50 text-sm text-milk-500">
        Loading…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-full min-h-screen bg-milk-50">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
