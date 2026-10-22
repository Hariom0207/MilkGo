import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { isValidPhone, sanitizePhone, PHONE_ERROR } from '../lib/phone'
import { inr } from '../lib/money'
import { Modal } from '../components/Modal'
import { StatusSelect } from '../components/StatusSelect'
import { TableSkeleton } from '../components/Skeleton'

type CustomerStatus = 'pending' | 'active'
type Customer = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  type: 'retailer' | 'walkin'
  status?: CustomerStatus
  outstandingBalance?: number
  totalPurchased?: number
}

const CUSTOMER_STATUS = ['pending', 'active'] as const

export function CustomerOrders() {
  const [rows, setRows] = useState<Customer[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', type: 'retailer' as 'retailer' | 'walkin' })
  const [phoneError, setPhoneError] = useState('')
  const [edit, setEdit] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '', type: 'retailer' as 'retailer' | 'walkin' })
  const [editPhoneError, setEditPhoneError] = useState('')

  const load = () => {
    api.get<Customer[]>('/customers').then(setRows).catch((err) => setError(err instanceof Error ? err.message : 'Failed')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.phone && !isValidPhone(form.phone)) { setPhoneError(PHONE_ERROR); return }
    setPhoneError('')
    try {
      await api.post('/customers', { name: form.name.trim(), phone: form.phone, email: form.email.trim(), address: form.address, type: form.type })
      setForm({ name: '', phone: '', email: '', address: '', type: 'retailer' })
      load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to add customer') }
  }

  const setStatus = async (c: Customer, status: CustomerStatus) => {
    if ((c.status ?? 'active') === status) return
    try { await api.patch(`/customers/${c.id}`, { status }); load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }
  const remove = async (c: Customer) => {
    if (!confirm(`Delete ${c.name}?`)) return
    try { await api.delete(`/customers/${c.id}`); load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }
  const openEdit = (c: Customer) => {
    setEdit(c)
    setEditForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', type: c.type })
    setEditPhoneError('')
  }
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!edit) return
    if (editForm.phone && !isValidPhone(editForm.phone)) { setEditPhoneError(PHONE_ERROR); return }
    try {
      await api.patch(`/customers/${edit.id}`, { name: editForm.name.trim(), phone: editForm.phone, email: editForm.email.trim(), address: editForm.address, type: editForm.type })
      setEdit(null); load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update') }
  }

  const input = 'rounded-lg border border-milk-200 px-3 py-2 text-sm outline-none focus:border-cyan-mid'
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Customers</h1>
      </header>
      <div className="space-y-6 p-8">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={add} className="grid gap-3 rounded-xl border border-milk-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-6">
          <input required placeholder="Customer name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile no." aria-invalid={!!phoneError} className={`${input} w-full ${phoneError ? 'border-red-400' : ''}`} value={form.phone} onChange={(e) => { const p = sanitizePhone(e.target.value); setForm({ ...form, phone: p }); setPhoneError(p && !isValidPhone(p) ? PHONE_ERROR : '') }} />
            {phoneError && <p className="mt-1 text-xs text-danger">{phoneError}</p>}
          </div>
          <input type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Address" className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'retailer' | 'walkin' })}>
            <option value="retailer">Retailer</option>
            <option value="walkin">Walk-in</option>
          </select>
          <button className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Add Customer</button>
        </form>
        <div className="overflow-x-auto rounded-xl border border-milk-200 bg-white">
          {loading ? <TableSkeleton rows={5} /> : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead><tr className="border-b border-milk-200 text-milk-500">{['Name', 'Type', 'Phone', 'Email', 'Status', 'Purchased', 'Due', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((c) => {
                  const status = c.status ?? 'active'
                  return (
                    <tr key={c.id} className="border-b border-milk-100">
                      <td className="px-4 py-3 font-medium">{c.name}<span className="block text-xs font-normal text-milk-500">{c.address}</span></td>
                      <td className="px-4 py-3 capitalize">{c.type}</td>
                      <td className="px-4 py-3">{c.phone || '—'}</td>
                      <td className="px-4 py-3">{c.email || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusSelect value={status} options={CUSTOMER_STATUS} onChange={(s) => setStatus(c, s as CustomerStatus)} />
                      </td>
                      <td className="px-4 py-3">{inr(c.totalPurchased ?? 0)}</td>
                      <td className="px-4 py-3">{inr(c.outstandingBalance ?? 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link to={`/customers/${c.id}`} aria-label="View" className="rounded-md p-1.5 text-milk-500 hover:bg-milk-50 hover:text-cyan-mid"><Eye className="size-4" /></Link>
                          <button type="button" aria-label="Edit" onClick={() => openEdit(c)} className="rounded-md p-1.5 text-milk-500 hover:bg-milk-50 hover:text-cyan-mid"><Pencil className="size-4" /></button>
                          <button type="button" aria-label="Delete" onClick={() => remove(c)} className="rounded-md p-1.5 text-milk-500 hover:bg-red-50 hover:text-danger"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!rows.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-milk-500">No customers yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {edit && (
        <Modal title="Edit customer" narrow onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit} className="flex flex-col gap-3">
            <input required placeholder="Name" className={input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <input type="email" placeholder="Email" className={input} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile no." aria-invalid={!!editPhoneError} className={`${input} ${editPhoneError ? 'border-red-400' : ''}`} value={editForm.phone} onChange={(e) => { const p = sanitizePhone(e.target.value); setEditForm({ ...editForm, phone: p }); setEditPhoneError(p && !isValidPhone(p) ? PHONE_ERROR : '') }} />
            {editPhoneError && <p className="text-xs text-danger">{editPhoneError}</p>}
            <input placeholder="Address" className={input} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            <select className={input} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'retailer' | 'walkin' })}>
              <option value="retailer">Retailer</option>
              <option value="walkin">Walk-in</option>
            </select>
            <button className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
