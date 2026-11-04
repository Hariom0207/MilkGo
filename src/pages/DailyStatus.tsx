import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../data/products'
import { booksId, deduction, loadSheets, saveSheet, type DaySheet } from '../lib/dayStatus'
import { displayCustomerCode } from '../lib/customerCode'
import { inr } from '../lib/money'
import type { UserProfile } from '../lib/roles'
import { DateField } from '../components/DateField'
import { Modal } from '../components/Modal'
import { PageSkeleton, TableSkeleton } from '../components/Skeleton'
import { StatusSelect } from '../components/StatusSelect'

type Item = { name: string; quantity: number; unit?: string; rate: number; amount?: number }
type Sale = {
  id: string
  date: string
  time?: string
  customerId?: string | null
  customerName?: string
  items?: Item[]
  total?: number
  status?: string
}
type Purchase = { id: string; date: string; items?: Item[]; total?: number }
type Customer = { id: string; name: string; code?: string }

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
const qtyText = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))
const DELIVERY = ['Pending', 'Delivered'] as const

function tally(orders: { items?: Item[] }[]) {
  const map = new Map<string, { qty: number; value: number; unit: string }>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const qty = Number(item.quantity) || 0
      const cur = map.get(item.name) ?? { qty: 0, value: 0, unit: item.unit || '' }
      cur.qty += qty
      cur.value += qty * (Number(item.rate) || 0)
      if (item.unit) cur.unit = item.unit
      map.set(item.name, cur)
    }
  }
  return map
}

/** Map Paid (older sales) onto the delivery chip without losing the stored value until changed. */
const deliveryValue = (status?: string) => (status === 'Delivered' ? 'Delivered' : 'Pending')

export function DailyStatus() {
  const { profile } = useAuth()
  const { products: catalog } = useCatalog()
  const [date, setDate] = useState(todayIso())
  const [sales, setSales] = useState<Sale[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [staff, setStaff] = useState<UserProfile[]>([])
  const [staffId, setStaffId] = useState('')
  const [sheets, setSheets] = useState<DaySheet[]>([])
  const [shared, setShared] = useState(true)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Sale | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<{ date: string; time: string; status: string; items: { name: string; quantity: string; unit: string; rate: number }[] } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!profile) return
    const vendorId = booksId(profile)
    const staffPath = profile.role === 'admin' ? '/admin/users' : '/team/staff'
    Promise.all([
      api.get<Sale[]>('/sales-orders').catch(() => []),
      api.get<Purchase[]>('/purchases').catch(() => []),
      api.get<Customer[]>('/customers').catch(() => []),
      profile.role === 'staff' ? Promise.resolve([profile]) : api.get<UserProfile[]>(staffPath).catch(() => []),
      loadSheets(vendorId),
    ]).then(([salesRows, purchaseRows, customerRows, people, stored]) => {
      setSales(salesRows)
      setPurchases(purchaseRows)
      setCustomers(customerRows)
      const distributors = people.filter((p) => p.role === 'staff' || profile.role === 'staff')
      setStaff(distributors)
      setStaffId(profile.role === 'staff' ? profile.id : distributors[0]?.id ?? '')
      setSheets(stored.sheets)
      setShared(stored.shared)
    }).finally(() => setLoading(false))
  }, [profile])

  const names = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers])
  const byId = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers])
  const daySales = useMemo(
    () => [...sales.filter((s) => s.date === date)].sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))),
    [sales, date],
  )
  const dayPurchases = useMemo(() => purchases.filter((p) => p.date === date), [purchases, date])
  const sold = useMemo(() => tally(daySales), [daySales])
  const bought = useMemo(() => tally(dayPurchases), [dayPurchases])
  const productCols = useMemo(() => {
    const names = [
      ...catalog.map((p) => p.name),
      ...daySales.flatMap((s) => (s.items ?? []).map((i) => i.name)),
      ...dayPurchases.flatMap((p) => (p.items ?? []).map((i) => i.name)),
    ]
    return [...new Set(names)]
  }, [catalog, daySales, dayPurchases])

  const productRate = (name: string) => {
    const purchase = bought.get(name)
    if (purchase && purchase.qty) return Math.round(purchase.value / purchase.qty)
    const sale = sold.get(name)
    if (sale && sale.qty) return Math.round(sale.value / sale.qty)
    return Math.round((catalog.find((p) => p.name === name)?.rate ?? 0) * 100)
  }

  /** Missing = purchase − sales (charged to distributor when purchase is short after sales). */
  const gapRows = productCols.map((name) => {
    const purchased = bought.get(name)?.qty ?? 0
    const soldQty = sold.get(name)?.qty ?? 0
    const missing = Math.max(0, purchased - soldQty)
    const unit = bought.get(name)?.unit || sold.get(name)?.unit || catalog.find((p) => p.name === name)?.unit || ''
    const rate = productRate(name)
    return { name, unit, purchased, soldQty, missing, rate, amount: Math.round(missing * rate) }
  })
  const missingLines = gapRows.filter((r) => r.missing > 0).map((r) => ({ name: r.name, unit: r.unit, missing: r.missing, rate: r.rate }))
  const month = date.slice(0, 7)
  const staffName = staff.find((s) => s.id === staffId)?.name || 'Distributor'
  const monthCut = deduction(sheets.filter((s) => s.staffId === staffId && s.date.startsWith(month)).flatMap((s) => s.lines))
  const pendingCount = daySales.filter((s) => deliveryValue(s.status) === 'Pending').length
  const deliveredCount = daySales.length - pendingCount
  const saleAmount = (sale: Sale) =>
    sale.total ?? (sale.items ?? []).reduce((sum, i) => sum + (i.amount ?? Math.round(Number(i.quantity) * Number(i.rate))), 0)
  const dayAmount = daySales.reduce((sum, s) => sum + saleAmount(s), 0)
  const dayPurchaseAmount = dayPurchases.reduce(
    (sum, p) => sum + (p.total ?? (p.items ?? []).reduce((s, i) => s + (i.amount ?? Math.round(Number(i.quantity) * Number(i.rate))), 0)),
    0,
  )
  const missingAmount = missingLines.reduce((sum, line) => sum + Math.round(line.missing * line.rate), 0)
  const showSummary = !!daySales.length || !!dayPurchases.length

  const customerName = (sale: Sale) => (sale.customerId && names[sale.customerId]) || sale.customerName || 'Customer'
  const customerCode = (sale: Sale) => {
    if (sale.customerId && byId[sale.customerId]) return displayCustomerCode(byId[sale.customerId])
    const match = customers.find((c) => c.name === sale.customerName)
    return match ? displayCustomerCode(match) : '—'
  }

  const openSale = (sale: Sale) => {
    setSelected(sale)
    setEditing(false)
    setDraft(null)
    setError('')
  }

  const startEdit = () => {
    if (!selected) return
    setDraft({
      date: selected.date,
      time: selected.time || '00:00',
      status: deliveryValue(selected.status),
      items: (selected.items ?? []).map((it) => ({
        name: it.name,
        quantity: String(it.quantity),
        unit: it.unit || '',
        rate: Number(it.rate) || 0,
      })),
    })
    setEditing(true)
  }

  const setStatus = async (sale: Sale, status: string) => {
    if (deliveryValue(sale.status) === status && (sale.status === 'Pending' || sale.status === 'Delivered')) return
    try {
      await api.patch(`/sales-orders/${sale.id}`, { status })
      setSales((cur) => cur.map((r) => (r.id === sale.id ? { ...r, status } : r)))
      setSelected((cur) => (cur && cur.id === sale.id ? { ...cur, status } : cur))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    }
  }

  const saveSale = async () => {
    if (!selected || !draft) return
    if (!draft.items.length || draft.items.some((i) => !(Number(i.quantity) > 0))) {
      setError('Add at least one product with a quantity.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const items = draft.items.map((i) => {
        const quantity = Number(i.quantity) || 0
        const rate = Number(i.rate) || 0
        return { name: i.name, unit: i.unit, quantity, rate, amount: Math.round(quantity * rate) }
      })
      const total = items.reduce((sum, i) => sum + i.amount, 0)
      const payload = { date: draft.date, time: draft.time, status: draft.status, items, total }
      await api.patch(`/sales-orders/${selected.id}`, payload)
      const next = { ...selected, ...payload }
      setSales((cur) => cur.map((r) => (r.id === selected.id ? next : r)))
      setSelected(next)
      setEditing(false)
      setDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update sale')
    } finally {
      setBusy(false)
    }
  }

  const deleteSale = async () => {
    if (!selected) return
    if (!confirm(`Delete sale for ${customerName(selected)} on ${selected.date}?`)) return
    setBusy(true)
    setError('')
    try {
      await api.delete(`/sales-orders/${selected.id}`)
      setSales((cur) => cur.filter((r) => r.id !== selected.id))
      setSelected(null)
      setEditing(false)
      setDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete sale')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!profile || !staffId) { setNote('Select a distributor / staff before assigning missing stock.'); return }
    const sheet: DaySheet = {
      date,
      staffId,
      staffName,
      returned: Object.fromEntries(gapRows.map((r) => [r.name, 0])),
      lines: missingLines,
    }
    const stored = await saveSheet(booksId(profile), sheet)
    setSheets(stored.sheets)
    setShared(stored.shared)
    setNote(missingLines.length
      ? `Missing ${inr(missingAmount)} assigned to ${staffName} for ${date}.${stored.shared ? '' : ' Stored on this browser until the server accepts daily returns.'}`
      : `No missing stock for ${date}. Nothing assigned to ${staffName}.`)
  }

  if (loading || !profile) return <PageSkeleton />

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Daily Status</h1>
        <DateField value={date} onChange={setDate} className="w-[200px]" />
      </header>

      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Orders', String(daySales.length)],
            ['Pending', String(pendingCount)],
            ['Delivered', String(deliveredCount)],
            ['Date', date],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-milk-200 bg-white p-4">
              <p className="text-sm text-milk-500">{label}</p>
              <p className="text-xl font-bold text-milk-900">{value}</p>
            </div>
          ))}
        </section>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-milk-900">Daily sales list</h2>
            <Link to="/sales/new" className="text-sm font-semibold text-cyan-mid hover:underline">Add sale</Link>
          </div>
          {loading ? <TableSkeleton rows={5} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                    <th className="whitespace-nowrap px-3 py-2">Customer ID</th>
                    <th className="whitespace-nowrap px-3 py-2">Name</th>
                    <th className="whitespace-nowrap px-3 py-2">Date</th>
                    <th className="whitespace-nowrap px-3 py-2">Time</th>
                    {productCols.map((name) => (
                      <th key={name} className="whitespace-nowrap px-3 py-2 text-center">{name}</th>
                    ))}
                    <th className="whitespace-nowrap px-3 py-2 text-right">Amount</th>
                    <th className="whitespace-nowrap px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {daySales.map((sale, i) => (
                    <tr
                      key={sale.id}
                      onClick={() => openSale(sale)}
                      className={`cursor-pointer border-b border-milk-100 hover:bg-cyan-soft ${i % 2 === 0 ? 'bg-milk-50' : 'bg-white'}`}
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-milk-500">{customerCode(sale)}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-milk-900">{customerName(sale)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-milk-500">{sale.date}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-milk-500">{sale.time || '—'}</td>
                      {productCols.map((name) => {
                        const item = (sale.items ?? []).find((it) => it.name === name)
                        const unit = item?.unit || catalog.find((p) => p.name === name)?.unit || ''
                        return (
                          <td key={name} className="whitespace-nowrap px-3 py-3 text-center text-milk-900">
                            {item ? `${qtyText(Number(item.quantity) || 0)} ${unit}`.trim() : '—'}
                          </td>
                        )
                      })}
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-milk-900">{inr(saleAmount(sale))}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <StatusSelect
                          value={deliveryValue(sale.status)}
                          options={DELIVERY}
                          onChange={(s) => setStatus(sale, s)}
                        />
                      </td>
                    </tr>
                  ))}
                  {!daySales.length && (
                    <tr>
                      <td colSpan={6 + productCols.length} className="px-3 py-8 text-center text-milk-400">
                        No sales for this date. Add a sale, then it appears here.
                      </td>
                    </tr>
                  )}
                </tbody>
                {showSummary && (
                  <tfoot>
                    <tr className="border-t-2 border-milk-200 bg-milk-50 text-sm font-bold text-milk-900">
                      <td className="whitespace-nowrap px-3 py-3" colSpan={4}>Total (sales)</td>
                      {productCols.map((name) => {
                        const tot = sold.get(name)
                        const unit = tot?.unit || catalog.find((p) => p.name === name)?.unit || ''
                        return (
                          <td key={name} className="whitespace-nowrap px-3 py-3 text-center">
                            {tot?.qty ? `${qtyText(tot.qty)} ${unit}`.trim() : '—'}
                          </td>
                        )
                      })}
                      <td className="whitespace-nowrap px-3 py-3 text-right text-cyan-deep">{inr(dayAmount)}</td>
                      <td className="px-3 py-3" />
                    </tr>
                    <tr className="bg-white text-sm font-semibold text-milk-900">
                      <td className="whitespace-nowrap px-3 py-3" colSpan={4}>Purchase</td>
                      {productCols.map((name) => {
                        const tot = bought.get(name)
                        const unit = tot?.unit || catalog.find((p) => p.name === name)?.unit || ''
                        return (
                          <td key={name} className="whitespace-nowrap px-3 py-3 text-center">
                            {tot?.qty ? `${qtyText(tot.qty)} ${unit}`.trim() : '—'}
                          </td>
                        )
                      })}
                      <td className="whitespace-nowrap px-3 py-3 text-right">{inr(dayPurchaseAmount)}</td>
                      <td className="px-3 py-3" />
                    </tr>
                    <tr className="bg-red-50/60 text-sm font-bold text-milk-900">
                      <td className="whitespace-nowrap px-3 py-3" colSpan={4}>Missing (purchase − sales)</td>
                      {gapRows.map((row) => (
                        <td key={row.name} className={`whitespace-nowrap px-3 py-3 text-center ${row.missing ? 'text-danger' : 'text-milk-400'}`}>
                          {row.missing ? `${qtyText(row.missing)} ${row.unit}`.trim() : '—'}
                        </td>
                      ))}
                      <td className={`whitespace-nowrap px-3 py-3 text-right ${missingAmount ? 'text-danger' : 'text-milk-400'}`}>{inr(missingAmount)}</td>
                      <td className="px-3 py-3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-milk-900">Assign missing to distributor / staff</h2>
              <p className="mt-1 text-sm text-milk-500">Missing = purchase − sales for {date}. Amount uses the purchase rate.</p>
            </div>
            {profile.role === 'staff' ? (
              <p className="text-sm font-semibold text-milk-700">{profile.name}</p>
            ) : (
              <label className="flex items-center gap-2 text-sm text-milk-500">
                Distributor
                <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="rounded-lg border border-milk-200 px-3 py-2 text-sm text-milk-900">
                  {!staff.length && <option value="">No staff yet</option>}
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
                </select>
              </label>
            )}
          </div>
          {!missingLines.length ? (
            <p className="text-sm text-success">No missing stock for this day.</p>
          ) : (
            <table className="mb-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                  <th className="px-3 py-2">Staff</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Missing qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {missingLines.map((line) => (
                  <tr key={line.name} className="border-b border-milk-100">
                    <td className="px-3 py-3 font-medium text-milk-900">{staffName}</td>
                    <td className="px-3 py-3">{line.name}</td>
                    <td className="px-3 py-3 text-right">{qtyText(line.missing)} {line.unit}</td>
                    <td className="px-3 py-3 text-right">{inr(line.rate)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-danger">{inr(Math.round(line.missing * line.rate))}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="px-3 py-3" colSpan={4}>Total deduct from {staffName}</td>
                  <td className="px-3 py-3 text-right text-danger">{inr(missingAmount)}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-milk-500">
              {staffName} this month: {inr(monthCut)} short.
              {profile.role !== 'staff' && <> Full sheet on <Link to="/distributors" className="font-semibold text-cyan-mid">Distributors</Link>.</>}
            </p>
            <button type="button" onClick={save} disabled={!staffId} className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {missingLines.length ? 'Assign missing to staff' : 'Save day sheet'}
            </button>
          </div>
          {note && <p className="mt-3 text-sm text-milk-700">{note}</p>}
          {!shared && <p className="mt-2 text-xs text-milk-400">Sheets are stored on this browser until the daily-returns API is available.</p>}
        </section>
      </div>

      {selected && (
        <Modal title={editing ? 'Edit sale' : 'Sale details'} onClose={() => { if (!busy) { setSelected(null); setEditing(false); setDraft(null) } }}>
          {!editing ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-milk-500">Customer ID</p><p className="font-mono font-semibold">{customerCode(selected)}</p></div>
                <div><p className="text-xs text-milk-500">Name</p><p className="font-semibold">{customerName(selected)}</p></div>
                <div><p className="text-xs text-milk-500">Date</p><p>{selected.date}</p></div>
                <div><p className="text-xs text-milk-500">Time</p><p>{selected.time || '—'}</p></div>
                <div>
                  <p className="mb-1 text-xs text-milk-500">Status</p>
                  <StatusSelect value={deliveryValue(selected.status)} options={DELIVERY} onChange={(s) => setStatus(selected, s)} />
                </div>
                <div><p className="text-xs text-milk-500">Total</p><p className="font-semibold text-cyan-deep">{inr(selected.total ?? (selected.items ?? []).reduce((s, i) => s + (i.amount ?? Math.round(i.quantity * i.rate)), 0))}</p></div>
              </div>
              <div className="overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-milk-200 text-xs text-milk-500">{['Product', 'Qty', 'Rate', 'Amount'].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {(selected.items ?? []).map((it) => (
                      <tr key={it.name} className="border-b border-milk-100">
                        <td className="px-2 py-2 font-medium">{it.name}</td>
                        <td className="px-2 py-2">{qtyText(Number(it.quantity) || 0)} {it.unit || ''}</td>
                        <td className="px-2 py-2">{inr(it.rate)}</td>
                        <td className="px-2 py-2 font-semibold">{inr(it.amount ?? Math.round(it.quantity * it.rate))}</td>
                      </tr>
                    ))}
                    {!(selected.items ?? []).length && <tr><td colSpan={4} className="px-2 py-4 text-center text-milk-400">No items</td></tr>}
                  </tbody>
                </table>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" disabled={busy} onClick={deleteSale} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60">
                  <Trash2 className="size-4" /> Delete
                </button>
                <button type="button" onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">
                  <Pencil className="size-4" /> Edit
                </button>
              </div>
            </>
          ) : draft && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase text-milk-500">Date</span>
                  <DateField value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase text-milk-500">Time</span>
                  <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="rounded-lg border border-milk-200 px-3 py-2" />
                </label>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase text-milk-500">Status</span>
                  <StatusSelect value={draft.status} options={DELIVERY} onChange={(s) => setDraft({ ...draft, status: s })} />
                </div>
                <div className="text-sm">
                  <p className="text-xs font-semibold uppercase text-milk-500">Customer</p>
                  <p className="mt-2 font-semibold">{customerName(selected)} <span className="font-mono text-xs text-milk-500">{customerCode(selected)}</span></p>
                </div>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {draft.items.map((it, idx) => (
                  <div key={it.name} className="flex items-center gap-2 rounded-lg border border-milk-200 p-2 text-sm">
                    <span className="min-w-0 flex-1 font-medium">{it.name}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={it.quantity}
                      onChange={(e) => setDraft({
                        ...draft,
                        items: draft.items.map((row, i) => i === idx ? { ...row, quantity: e.target.value } : row),
                      })}
                      className="w-24 rounded-md border border-milk-200 px-2 py-1 text-right"
                      aria-label={`${it.name} quantity`}
                    />
                    <span className="w-14 text-xs text-milk-500">{it.unit}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${it.name}`}
                      onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) })}
                      className="rounded-md p-1.5 text-milk-400 hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-milk-500">Add product</span>
                  <select
                    className="rounded-lg border border-milk-200 px-3 py-2"
                    value=""
                    onChange={(e) => {
                      const name = e.target.value
                      if (!name || draft.items.some((i) => i.name === name)) return
                      const p = catalog.find((c) => c.name === name)
                      setDraft({
                        ...draft,
                        items: [...draft.items, { name, quantity: '1', unit: p?.unit || '', rate: Math.round((p?.rate ?? 0) * 100) }],
                      })
                    }}
                  >
                    <option value="">Select…</option>
                    {catalog.filter((p) => !draft.items.some((i) => i.name === p.name)).map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" disabled={busy} onClick={() => { setEditing(false); setDraft(null); setError('') }} className="rounded-lg border border-milk-200 px-4 py-2 text-sm font-semibold text-milk-700">Cancel</button>
                <button type="button" disabled={busy} onClick={saveSale} className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
