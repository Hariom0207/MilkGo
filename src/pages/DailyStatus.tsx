import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../data/products'
import { booksId, deduction, loadSheets, reconcile, saveSheet, type DaySheet } from '../lib/dayStatus'
import { inr } from '../lib/money'
import type { UserProfile } from '../lib/roles'
import { PageSkeleton } from '../components/Skeleton'

type Item = { name: string; quantity: number; unit?: string; rate: number }
type Sale = { id: string; date: string; customerId?: string | null; customerName?: string; items?: Item[] }
type Purchase = { id: string; date: string; items?: Item[] }

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
const qtyText = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))

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

export function DailyStatus() {
  const { profile } = useAuth()
  const { products: catalog } = useCatalog()
  const [date, setDate] = useState(todayIso())
  const [sales, setSales] = useState<Sale[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [staff, setStaff] = useState<UserProfile[]>([])
  const [staffId, setStaffId] = useState('')
  const [sheets, setSheets] = useState<DaySheet[]>([])
  const [returned, setReturned] = useState<Record<string, string>>({})
  const [shared, setShared] = useState(true)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const vendorId = booksId(profile)
    const staffPath = profile.role === 'admin' ? '/admin/users' : '/team/staff'
    Promise.all([
      api.get<Sale[]>('/sales-orders').catch(() => []),
      api.get<Purchase[]>('/purchases').catch(() => []),
      api.get<{ id: string; name: string }[]>('/customers').catch(() => []),
      profile.role === 'staff' ? Promise.resolve([profile]) : api.get<UserProfile[]>(staffPath).catch(() => []),
      loadSheets(vendorId),
    ]).then(([salesRows, purchaseRows, customers, people, stored]) => {
      setSales(salesRows)
      setPurchases(purchaseRows)
      setNames(Object.fromEntries(customers.map((c) => [c.id, c.name])))
      const distributors = people.filter((p) => p.role === 'staff' || profile.role === 'staff')
      setStaff(distributors)
      setStaffId(profile.role === 'staff' ? profile.id : distributors[0]?.id ?? '')
      setSheets(stored.sheets)
      setShared(stored.shared)
    }).finally(() => setLoading(false))
  }, [profile])

  useEffect(() => {
    const sheet = sheets.find((s) => s.date === date && s.staffId === staffId)
    const next: Record<string, string> = {}
    for (const [name, qty] of Object.entries(sheet?.returned ?? {})) next[name] = String(qty)
    setReturned(next)
  }, [date, staffId, sheets])

  const daySales = sales.filter((s) => s.date === date)
  const dayPurchases = purchases.filter((p) => p.date === date)
  const sold = tally(daySales)
  const bought = tally(dayPurchases)
  const productNames = [...new Set<string>([...sold.keys(), ...bought.keys()])]

  const rows = productNames.map((name) => {
    const purchase = bought.get(name)
    const sale = sold.get(name)
    const purchased = purchase?.qty ?? 0
    const soldQty = sale?.qty ?? 0
    const back = Number(returned[name]) || 0
    const unit = purchase?.unit || sale?.unit || catalog.find((p) => p.name === name)?.unit || ''
    const rate = purchase && purchase.qty
      ? Math.round(purchase.value / purchase.qty)
      : Math.round((catalog.find((p) => p.name === name)?.rate ?? 0) * 100) || (sale && sale.qty ? Math.round(sale.value / sale.qty) : 0)
    const check = reconcile(purchased, soldQty, back)
    return { name, unit, purchased, soldQty, rate, ...check }
  })

  const missingLines = rows.filter((r) => r.missing > 0).map((r) => ({ name: r.name, unit: r.unit, missing: r.missing, rate: r.rate }))
  const month = date.slice(0, 7)
  const staffName = staff.find((s) => s.id === staffId)?.name || 'Distributor'
  const monthCut = deduction(sheets.filter((s) => s.staffId === staffId && s.date.startsWith(month)).flatMap((s) => s.lines))

  const customerName = (sale: Sale) => (sale.customerId && names[sale.customerId]) || sale.customerName || 'Customer'

  async function save() {
    if (!profile || !staffId) { setNote('Add a staff distributor before saving the return.'); return }
    const returnedQty: Record<string, number> = {}
    for (const row of rows) returnedQty[row.name] = Number(returned[row.name]) || 0
    const sheet: DaySheet = { date, staffId, staffName, returned: returnedQty, lines: missingLines }
    const stored = await saveSheet(booksId(profile), sheet)
    setSheets(stored.sheets)
    setShared(stored.shared)
    setNote(missingLines.length
      ? `Missing stock saved for ${staffName}.${stored.shared ? '' : ' Stored on this browser until the server accepts daily returns.'}`
      : `Return matches. Nothing to deduct for ${staffName} on ${date}.`)
  }

  if (loading || !profile) return <PageSkeleton />

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Daily Status</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-milk-200 px-3 py-2 text-sm" />
      </header>

      <div className="flex flex-col gap-6 p-8">
        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-milk-900">Today's sales</h2>
            {profile.role === 'staff' ? (
              <p className="text-sm text-milk-500">{profile.name}</p>
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                <th className="px-3 py-2">Customer name</th>
                <th className="px-3 py-2">Product</th>
              </tr>
            </thead>
            <tbody>
              {daySales.map((sale) => (
                <tr key={sale.id} className="border-b border-milk-100">
                  <td className="px-3 py-3 font-medium text-milk-900">{customerName(sale)}</td>
                  <td className="px-3 py-3 text-milk-700">
                    {(sale.items ?? []).map((item) => `${item.name} ${qtyText(Number(item.quantity) || 0)} ${item.unit ?? ''}`.trim()).join(', ') || '—'}
                  </td>
                </tr>
              ))}
              {!daySales.length && (
                <tr><td colSpan={2} className="px-3 py-6 text-center text-milk-400">No sales for this date.</td></tr>
              )}
              {!!rows.length && (
                <tr className="bg-milk-50 font-semibold text-milk-900">
                  <td className="px-3 py-3">Total sold</td>
                  <td className="px-3 py-3">{rows.filter((r) => r.soldQty).map((r) => `${r.name} ${qtyText(r.soldQty)} ${r.unit}`.trim()).join(', ') || '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-1 text-base font-semibold text-milk-900">Purchase vs return</h2>
          <p className="mb-4 text-sm text-milk-500">Should return = purchased − sold. Enter what the distributor brought back. A short return is missing stock.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Purchased</th>
                  <th className="px-3 py-2 text-right">Sold</th>
                  <th className="px-3 py-2 text-right">Should return</th>
                  <th className="px-3 py-2 text-right">Returned</th>
                  <th className="px-3 py-2 text-right">Missing</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-milk-100">
                    <td className="px-3 py-3 font-medium text-milk-900">{row.name}</td>
                    <td className="px-3 py-3 text-right">{qtyText(row.purchased)} {row.unit}</td>
                    <td className="px-3 py-3 text-right">
                      {qtyText(row.soldQty)} {row.unit}
                      {row.oversold > 0 && <span className="mt-1 block text-xs text-danger">Sold {qtyText(row.oversold)} more than purchased</span>}
                    </td>
                    <td className="px-3 py-3 text-right">{qtyText(row.expected)} {row.unit}</td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={returned[row.name] ?? ''}
                        onChange={(e) => setReturned((cur) => ({ ...cur, [row.name]: e.target.value }))}
                        className="w-24 rounded-lg border border-milk-200 px-2 py-1 text-right"
                        aria-label={`Returned ${row.name}`}
                      />
                    </td>
                    <td className={`px-3 py-3 text-right font-semibold ${row.missing ? 'text-danger' : 'text-success'}`}>
                      {row.missing ? `${qtyText(row.missing)} ${row.unit}` : 'Match'}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-milk-400">No purchase or sales for this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-milk-900">Missing products</h2>
          {!missingLines.length ? (
            <p className="text-sm text-success">Return matches the day's purchase and sales.</p>
          ) : (
            <table className="mb-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Missing</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {missingLines.map((line) => (
                  <tr key={line.name} className="border-b border-milk-100">
                    <td className="px-3 py-3">{line.name}</td>
                    <td className="px-3 py-3 text-right">{qtyText(line.missing)} {line.unit}</td>
                    <td className="px-3 py-3 text-right">{inr(Math.round(line.missing * line.rate))}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="px-3 py-3" colSpan={2}>Deduct from {staffName}</td>
                  <td className="px-3 py-3 text-right text-danger">{inr(deduction(missingLines))}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-milk-500">
              {staffName} this month: {inr(monthCut)} short.
              {profile.role !== 'staff' && <> See the full sheet on <Link to="/distributors" className="font-semibold text-cyan-mid">Distributors</Link>.</>}
            </p>
            <button type="button" onClick={save} className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white">Save return</button>
          </div>
          {note && <p className="mt-3 text-sm text-milk-700">{note}</p>}
          {!shared && <p className="mt-2 text-xs text-milk-400">Returns are stored on this browser. They show under Distributors on this device.</p>}
        </section>
      </div>
    </div>
  )
}
