export type Role = 'admin' | 'vendor' | 'staff' // hierarchy: admin(1) > vendor(2) > staff(3)
export type Status = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  status: Status
  /** Owner vendor uid. For vendor = own uid, staff = creator vendor uid, admin = null */
  vendorId: string | null
  createdAt?: unknown
  lastLoginAt?: unknown
  loginCount?: number
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)

export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase())

/** Nav paths each role may open. Admin: all. */
export const ROLE_ROUTES: Record<Role, string[]> = {
  admin: ['*'],
  vendor: ['/home', '/purchase', '/sales', '/inventory', '/distributors', '/customers', '/products', '/reports', '/settings', '/team'],
  staff: ['/home', '/purchase', '/sales', '/inventory', '/customers', '/products'], // entry only
}
export const canAccess = (role: Role, path: string) =>
  ROLE_ROUTES[role].includes('*') || ROLE_ROUTES[role].some((p) => path === p || path.startsWith(p + '/'))
