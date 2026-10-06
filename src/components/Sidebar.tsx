import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Archive,
  Truck,
  Users,
  Box,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import avatar from '../assets/avatar.png'
import logoHeader from '../assets/logo-header.png'

const navItems = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/purchase', label: 'Purchase', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ShoppingBag },
  { to: '/inventory', label: 'Inventory', icon: Archive },
  { to: '/distributors', label: 'Distributors', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Box },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('milkgo_user') : null
  const user = userStr ? JSON.parse(userStr) : null
  const displayName = user?.fullName || user?.identifier || 'Ramesh Kumar'

  const handleLogout = () => {
    localStorage.removeItem('milkgo_user')
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col gap-8 border-r border-milk-200 bg-white px-4 py-6">
      <div className="w-full">
        <img
          src={logoHeader}
          alt="MilkGo"
          className="h-14 w-full max-w-none object-contain object-left"
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors',
                isActive
                  ? 'bg-cyan-soft font-semibold text-cyan-deep'
                  : 'font-medium text-milk-500 hover:bg-milk-50 hover:text-milk-700',
              ].join(' ')
            }
          >
            <Icon className="size-5 shrink-0" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile & Navigating to Login / Sign Up */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-milk-50 p-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={avatar}
            alt={displayName}
            className="size-9 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-milk-900">{displayName}</p>
            <p className="truncate text-xs text-milk-500">Plant Manager</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out / Go to Login"
          className="rounded-md p-1.5 text-milk-400 hover:bg-milk-200/70 hover:text-red-600 transition cursor-pointer"
        >
          <LogOut className="size-4 shrink-0" />
        </button>
      </div>
    </aside>
  )
}
