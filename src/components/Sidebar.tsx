import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Archive, Truck, Users, Box,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import avatar from '../assets/avatar.png'
import { useAuth } from '../context/AuthContext'
import logoHeader from '../assets/logo-header.png'
import { canAccess } from '../lib/roles'
import { Modal } from './Modal'
import { useState } from 'react'

const navItems = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/team', label: 'My Staff', icon: Users },
  { to: '/purchase', label: 'Purchase', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ShoppingBag },
  { to: '/inventory', label: 'Inventory', icon: Archive },
  { to: '/distributors', label: 'Distributors', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Box },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

type Props = { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void }

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: Props) {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  const [confirmOut, setConfirmOut] = useState(false)
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null)
  const displayName = profile?.name || user?.displayName || user?.email || 'MilkGo User'
  const items = navItems.filter((i) =>
    i.to === '/admin/users' ? profile?.role === 'admin'
    : i.to === '/team' ? profile?.role === 'vendor' || profile?.role === 'admin'
    : profile ? canAccess(profile.role, i.to) : false)

  const handleLogout = async () => { setConfirmOut(false); await logout(); navigate('/login') }
  const hideOnDesktop = collapsed ? 'lg:hidden' : '' // labels/logo only collapse on desktop, never on mobile drawer

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] shrink-0 flex-col gap-6 border-r border-milk-200 bg-white px-4 py-5 transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-[76px] lg:px-2' : 'lg:w-[260px]'}`}>
        {/* Logo + toggles */}
        <div className={`flex shrink-0 items-center gap-2 ${collapsed ? 'lg:flex-col lg:justify-center' : ''}`}>
          <img src={logoHeader} alt="MilkGo" className={`h-11 min-w-0 flex-1 object-contain object-left ${hideOnDesktop}`} />
          <span className={`size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-mid text-lg font-bold text-white ${collapsed ? 'hidden lg:flex' : 'hidden'}`}>M</span>
          <button type="button" onClick={onCloseMobile} aria-label="Close menu" className="ml-auto shrink-0 rounded-md p-1.5 text-milk-500 hover:bg-milk-50 lg:hidden"><X className="size-5" /></button>
          <button type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden size-7 shrink-0 items-center justify-center rounded-full border border-milk-200 bg-white text-cyan-deep shadow-sm lg:flex">
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onCloseMobile}
              onMouseEnter={(e) => { if (collapsed) { const r = e.currentTarget.getBoundingClientRect(); setTip({ label, top: r.top + r.height / 2, left: r.right + 10 }) } }}
              onMouseLeave={() => setTip(null)}
              className={({ isActive }) => ['flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors', collapsed ? 'lg:justify-center lg:px-0' : '', isActive ? 'bg-cyan-soft font-semibold text-cyan-deep' : 'font-medium text-milk-500 hover:bg-milk-50 hover:text-milk-700'].join(' ')}>
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              <span className={`truncate ${hideOnDesktop}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile + logout */}
        <div className={`mt-auto flex shrink-0 items-center gap-2 rounded-lg bg-milk-50 p-3 ${collapsed ? 'lg:flex-col lg:justify-center' : 'justify-between'}`}>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={avatar} alt={displayName} className="size-9 shrink-0 rounded-full object-cover" />
            <div className={`min-w-0 ${hideOnDesktop}`}>
              <p className="truncate text-sm font-semibold text-milk-900">{displayName}</p>
              <p className="truncate text-xs capitalize text-milk-500">{profile?.role ?? ''}</p>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmOut(true)} title="Sign out" aria-label="Sign out" className="shrink-0 rounded-md p-1.5 text-milk-400 transition hover:bg-milk-200/70 hover:text-red-600">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Collapsed-rail tag (like reference): shows label tag beside icon on hover, desktop only */}
      {collapsed && tip && (
        <span className="pointer-events-none fixed z-[70] hidden -translate-y-1/2 items-center lg:flex" style={{ top: tip.top, left: tip.left }}>
          <span className="-mr-1 size-2 rotate-45 bg-cyan-deep" />
          <span className="rounded-md bg-cyan-deep px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-md">{tip.label}</span>
        </span>
      )}

      {confirmOut && (
        <Modal title="Sign out?" narrow onClose={() => setConfirmOut(false)}>
          <p className="text-sm text-milk-500">Are you sure you want to sign out of MilkGo?</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmOut(false)} className="rounded-lg border border-milk-200 px-4 py-2 text-sm font-semibold text-milk-700">Cancel</button>
            <button onClick={handleLogout} className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white">Sign Out</button>
          </div>
        </Modal>
      )}
    </>
  )
}
