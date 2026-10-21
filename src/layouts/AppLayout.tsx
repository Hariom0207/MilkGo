import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import logoHeader from '../assets/logo-header.png'
import { PageSkeleton } from '../components/Skeleton'

export function AppLayout() {
  const { user, profile, loading, logout } = useAuth()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('sidebar-collapsed') === '1' } catch { return false } })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname]) // close drawer on navigation (mobile/tablet)
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem('sidebar-collapsed', c ? '0' : '1') } catch { /* ignore */ } return !c })

  if (loading) return <div className="min-h-screen bg-milk-50"><PageSkeleton /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!profile || profile.status !== 'approved') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-milk-50 p-6">
        <div className="max-w-md rounded-2xl border border-milk-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold">{!profile ? 'Setting up your account…' : profile.status === 'pending' ? 'Waiting for Admin Approval' : `Account ${profile.status}`}</h1>
          <p className="mt-2 text-sm text-milk-500">{profile?.status === 'pending' ? 'Your vendor account is registered. An admin must approve it before you can access the dashboard.' : 'Please contact your admin.'}</p>
          <button onClick={logout} className="mt-5 rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Sign out</button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh bg-milk-50">
      {mobileOpen && <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
      <Sidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet topbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-milk-200 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-md p-2 text-milk-700 hover:bg-milk-50"><Menu className="size-5" /></button>
          <img src={logoHeader} alt="MilkGo" className="h-8 w-auto object-contain" />
          <span className="ml-auto truncate text-xs font-semibold capitalize text-milk-500">{profile.role}</span>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden"><Outlet /></main>
      </div>
    </div>
  )
}
