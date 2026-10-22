import { useCallback, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { isValidPhone, sanitizePhone, PHONE_ERROR } from '../lib/phone'
import { useAuth } from '../context/AuthContext'
import type { Status, UserProfile } from '../lib/roles'
import { Modal } from '../components/Modal'
import { StatusSelect } from '../components/StatusSelect'
import { TableSkeleton } from '../components/Skeleton'

const lastLogin = (u: UserProfile) => {
  const t = u.lastLoginAt as { toDate?: () => Date; _seconds?: number } | null
  if (t?.toDate) return t.toDate().toLocaleString()
  if (t?._seconds) return new Date(t._seconds * 1000).toLocaleString()
  return '—'
}

const STATUSES: Status[] = ['pending', 'approved', 'suspended', 'rejected']

/** mode=admin: all users + approve/manage. mode=team: my staff + create staff (vendor/admin). */
export function UserManagement({ mode }: { mode: 'admin' | 'team' }) {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [edit, setEdit] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })
  const [phoneError, setPhoneError] = useState('')
  const [editPhoneError, setEditPhoneError] = useState('')
  const handlePhone = (v: string) => {
    const d = sanitizePhone(v)
    setForm({ ...form, phone: d })
    setPhoneError(d && !isValidPhone(d) ? PHONE_ERROR : '')
  }
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
    if (status === u.status) return
    try { await api.patch(mode === 'admin' ? `/admin/users/${u.id}` : `/team/staff/${u.id}`, { status }); load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }
  const remove = async (u: UserProfile) => {
    if (!confirm(`Delete ${u.name || u.email}? This removes their login.`)) return
    try { await api.delete(mode === 'admin' ? `/admin/users/${u.id}` : `/team/staff/${u.id}`); load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }
  const openEdit = (u: UserProfile) => { setEdit(u); setEditForm({ name: u.name || '', phone: u.phone || '', email: u.email || '' }); setEditPhoneError('') }
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!edit) return
    if (!isValidPhone(editForm.phone)) { setEditPhoneError(PHONE_ERROR); return }
    const email = editForm.email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }
    try {
      await api.patch(mode === 'admin' ? `/admin/users/${edit.id}` : `/team/staff/${edit.id}`, { name: editForm.name.trim(), phone: editForm.phone, email })
      setEdit(null); load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update') }
  }

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!isValidPhone(form.phone)) { setPhoneError(PHONE_ERROR); return }
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
            <div>
              <input required type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="10-digit mobile no." aria-invalid={!!phoneError} className={`${input} w-full ${phoneError ? 'border-red-400' : ''}`} value={form.phone} onChange={(e) => handlePhone(e.target.value)} />
              {phoneError && <p className="mt-1 text-xs text-danger">{phoneError}</p>}
            </div>
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
                  <td className="px-4 py-3">
                    <StatusSelect value={u.status} options={STATUSES} disabled={u.id === profile?.id} onChange={(s) => setStatus(u, s as Status)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-milk-500">{lastLogin(u)}<span className="block">{u.loginCount ? `${u.loginCount} login(s)` : ''}</span></td>
                  <td className="px-4 py-3">
                    {u.id === profile?.id ? <span className="rounded-full bg-milk-100 px-3 py-1.5 text-xs font-semibold text-milk-500">You</span> : (
                      <div className="flex gap-1">
                        <button type="button" aria-label="Edit" onClick={() => openEdit(u)} className="rounded-md p-1.5 text-milk-500 hover:bg-milk-50 hover:text-cyan-mid"><Pencil className="size-4" /></button>
                        <button type="button" aria-label="Delete" onClick={() => remove(u)} className="rounded-md p-1.5 text-milk-500 hover:bg-red-50 hover:text-danger"><Trash2 className="size-4" /></button>
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
        <p className="text-xs text-milk-500">Open the status chip to change it. Suspend and reject also disable the login.</p>
      </div>
      {edit && (
        <Modal title="Edit" narrow onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit} className="flex flex-col gap-3">
            <input required placeholder="Name" className={input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <input required type="email" placeholder="Email" className={input} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input required type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile no." aria-invalid={!!editPhoneError} className={`${input} ${editPhoneError ? 'border-red-400' : ''}`} value={editForm.phone} onChange={(e) => { const p = sanitizePhone(e.target.value); setEditForm({ ...editForm, phone: p }); setEditPhoneError(p && !isValidPhone(p) ? PHONE_ERROR : '') }} />
            {editPhoneError && <p className="text-xs text-danger">{editPhoneError}</p>}
            <button className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
