import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Status, UserProfile } from '../lib/roles'
import { TableSkeleton } from '../components/Skeleton'

const lastLogin = (u: UserProfile) => {
  const t = u.lastLoginAt as { toDate?: () => Date; _seconds?: number } | null
  if (t?.toDate) return t.toDate().toLocaleString()
  if (t?._seconds) return new Date(t._seconds * 1000).toLocaleString()
  return '—'
}

const badge = (s: Status) =>
  ({ pending: 'bg-stock-low-bg text-stock-low', approved: 'bg-stock-in-bg text-stock-in', rejected: 'bg-stock-out-bg text-stock-out', suspended: 'bg-stock-out-bg text-stock-out' }[s])

/** mode=admin: all users + approve/manage. mode=team: my staff + create staff (vendor/admin). */
export function UserManagement({ mode }: { mode: 'admin' | 'team' }) {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [loading, setLoading] = useState(true)

  // Data comes from MilkGo-backend (RBAC authority). Requires backend running on VITE_API_URL.
  const load = useCallback(async () => {
    if (!profile) return
    try { setUsers(await api.get<UserProfile[]>(mode === 'admin' ? '/admin/users' : '/team/staff')); setError('') }
    catch (err) { setError(err instanceof Error ? `Backend error: ${err.message}` : 'Backend unavailable') }
    finally { setLoading(false) }
  }, [profile, mode])
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [load])

  const setStatus = async (u: UserProfile, status: Status) => {
    try { await api.patch(mode === 'admin' ? `/admin/users/${u.id}` : `/team/staff/${u.id}`, { status }); load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }
  const remove = async (u: UserProfile) => { try { await api.delete(`/admin/users/${u.id}`); load() } catch (err) { setError(err instanceof Error ? err.message : 'Failed') } }

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/team/staff', { name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password })
      setForm({ name: '', email: '', phone: '', password: '' }); load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create staff') }
  }

  const input = 'rounded-lg border border-milk-200 px-3 py-2 text-sm outline-none focus:border-cyan-mid'
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{mode === 'admin' ? 'Users (Admin)' : 'My Staff'}</h1>
      </header>
      <div className="space-y-6 p-8">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {mode === 'admin' && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[['Total Users', users.length], ['Logged In Users', users.filter((u) => u.lastLoginAt || (u.loginCount ?? 0) > 0).length], ['Admins', users.filter((u) => u.role === 'admin').length], ['Vendors', users.filter((u) => u.role === 'vendor').length], ['Staff', users.filter((u) => u.role === 'staff').length], ['Pending', users.filter((u) => u.status === 'pending').length]]
              .map(([l, v]) => <div key={l} className="rounded-xl border border-milk-200 bg-white p-4"><p className="text-sm text-milk-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>)}
          </div>
        )}

        {mode === 'team' && (
          <form onSubmit={createStaff} className="grid gap-3 rounded-xl border border-milk-200 bg-white p-5 md:grid-cols-5">
            <input required placeholder="Staff name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input required minLength={6} type="password" placeholder="Password" className={input} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Add Staff</button>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-milk-200 bg-white">
          {loading ? <TableSkeleton rows={5} /> : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="border-b border-milk-200 text-milk-500">{['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-milk-100">
                  <td className="px-4 py-3 font-medium">{u.name || '—'}<span className="block text-xs font-normal text-milk-500">{u.phone}</span></td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-xs text-milk-500">{lastLogin(u)}<span className="block">{u.loginCount ? `${u.loginCount} login(s)` : ''}</span></td>
                  <td className="px-4 py-3">
                    {u.id === profile?.id ? <span className="rounded-full bg-milk-100 px-3 py-1.5 text-xs font-semibold text-milk-500">You</span> : (
                      <div>
                        <button onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const top = r.bottom + 164 > window.innerHeight ? r.top - 164 : r.bottom + 4; setMenu(menu?.id === u.id ? null : { id: u.id, top, left: r.right - 144 }) }} className="rounded-full border border-milk-200 bg-white px-3 py-1.5 text-xs font-semibold text-milk-700 shadow-sm hover:bg-milk-50">Actions ▾</button>
                        {menu?.id === u.id && <>
                          <button aria-hidden tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setMenu(null)} />
                          <div style={{ top: menu.top, left: menu.left }} className="fixed z-50 w-36 rounded-xl border border-milk-200 bg-white py-1 shadow-lg">
                            {u.status !== 'approved' && <button onClick={() => { setStatus(u, 'approved'); setMenu(null) }} className="block w-full px-3 py-2 text-left text-sm text-success hover:bg-milk-50">Approve</button>}
                            {u.status === 'approved' && <button onClick={() => { setStatus(u, 'suspended'); setMenu(null) }} className="block w-full px-3 py-2 text-left text-sm text-warn hover:bg-milk-50">Suspend</button>}
                            {u.status !== 'rejected' && <button onClick={() => { setStatus(u, 'rejected'); setMenu(null) }} className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-milk-50">Reject</button>}
                            {mode === 'admin' && <button onClick={() => { remove(u); setMenu(null) }} className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-milk-50">Delete</button>}
                          </div>
                        </>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-milk-500">No users found. Users appear here after they sign up / log in once.</td></tr>}
            </tbody>
          </table>
          )}
        </div>
        <p className="text-xs text-milk-500">Actions are enforced by MilkGo-backend: suspend/reject also disables the Firebase login, delete removes the account completely.</p>
      </div>
    </div>
  )
}
