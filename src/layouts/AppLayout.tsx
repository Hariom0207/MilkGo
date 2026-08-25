import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen bg-milk-50">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
