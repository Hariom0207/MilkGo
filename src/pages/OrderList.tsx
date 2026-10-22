import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import { KpiRow } from '../components/KpiRow'
import { StatusSelect } from '../components/StatusSelect'
import { api } from '../lib/api'
import { useCatalog } from '../data/products'
import { ProductImage } from '../components/ProductImage'
import { Modal } from '../components/Modal'
import { TableSkeleton } from '../components/Skeleton'

type Order = {
  id: string
  customerId?: string | null
  [partyKey: string]: unknown
  date: string
  time: string
  items: { name: string; quantity: number; unit?: string; rate: number; amount: number }[]
  total: number
  status: string
}

type OrderListProps = {
  title: string
  listTitle: string
  partyHeader: string
  partyKey: string
  endpoint: string
  addTo: string
}

const inr = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

export function OrderList({ title, listTitle, partyHeader, partyKey, endpoint, addTo }: OrderListProps) {
  const [rows, setRows] = useState<Order[]>([])
  const { products: catalog } = useCatalog()
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [onlyToday, setOnlyToday] = useState(false)
  const today = todayIso()
  const [nameById, setNameById] = useState<Record<string, string>>({})
  useEffect(() => {
    setLoading(true)
    api.get<Order[]>(endpoint).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
    if (partyKey === 'customerName') {
      api.get<{ id: string; name: string }[]>('/customers').then((cs) => setNameById(Object.fromEntries(cs.map((c) => [c.id, c.name])))).catch(() => {})
    }
  }, [endpoint, partyKey])

  const setStatus = async (row: Order, status: string) => {
    if (status === row.status) return
    try {
      await api.patch(`${endpoint}/${row.id}`, { status })
      setRows((cur) => cur.map((r) => r.id === row.id ? { ...r, status } : r))
      setSelected((cur) => cur && cur.id === row.id ? { ...cur, status } : cur)
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update status') }
  }
  const shown = onlyToday ? rows.filter((r) => r.date === today) : rows
  const sum = (list: Order[]) => list.reduce((s, r) => s + (r.total || 0), 0)
  const todayRows = rows.filter((r) => r.date === today)
  const pending = rows.filter((r) => r.status === 'Pending')
  const kpis = [
    { label: "Today", value: inr(sum(todayRows)), badge: String(todayRows.length), tone: 'up' as const },
    { label: 'Total', value: inr(sum(rows)), badge: String(rows.length), tone: 'up' as const },
    { label: 'Pending', value: String(pending.length), badge: inr(sum(pending)), tone: 'down' as const },
    { label: 'Showing', value: String(shown.length), badge: onlyToday ? 'Today' : 'All', tone: 'up' as const },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{title}</h1>
        <Link
          to={addTo}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-cyan-mid px-3 text-[13px] font-semibold text-white"
        >
          <Plus className="size-4" />
          Add Order
        </Link>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <KpiRow items={kpis} />
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <article className="rounded-xl border border-milk-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-milk-900">{onlyToday ? `Daily list · ${today}` : listTitle}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOnlyToday((v) => !v)} className="rounded-md border border-milk-200 bg-white px-3 py-2 text-[13px] font-semibold text-milk-900">
                {onlyToday ? 'Show all' : 'Daily list'}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-milk-200 bg-milk-50 px-3 py-2 text-[13px] font-semibold text-milk-900"
              >
                <Download className="size-4" />
                Export Excel
              </button>
            </div>
          </div>
          {loading ? <TableSkeleton rows={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-left">
              <thead>
                <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                  <th className="whitespace-nowrap px-3 py-2 font-semibold">Date</th>
                  <th className="whitespace-nowrap px-3 py-2 font-semibold">Time</th>
                  <th className="whitespace-nowrap px-3 py-2 font-semibold">{partyHeader}</th>
                  {catalog.map((p) => (
                    <th key={p.name} className="whitespace-nowrap px-3 py-2 text-center font-semibold">
                      {p.name}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="whitespace-nowrap px-3 py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={4 + catalog.length} className="py-6 text-center text-[13px] text-milk-400">
                      No records yet
                    </td>
                  </tr>
                )}
                {shown.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className={`cursor-pointer border-b border-milk-200 text-[13px] hover:bg-cyan-soft ${i % 2 === 0 ? 'bg-milk-50' : 'bg-white'}`}
                  >
                    <td className="whitespace-nowrap px-3 py-3 align-top text-milk-500">{row.date}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top text-milk-500">{row.time}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top font-medium text-milk-900">{(row.customerId && nameById[row.customerId]) || String(row[partyKey])}</td>
                    {catalog.map((p) => {
                      const item = row.items.find((it) => it.name === p.name)
                      return (
                        <td key={p.name} className="whitespace-nowrap px-3 py-3 text-center align-top text-milk-900">
                          {item ? `${item.quantity} ${item.unit ?? p.unit}` : '-'}
                        </td>
                      )
                    })}
                    <td className="whitespace-nowrap px-3 py-3 text-right align-top font-semibold text-milk-900">{inr(row.total)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-center align-top" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect value={row.status || 'Pending'} options={['Pending', 'Paid']} onChange={(s) => setStatus(row, s)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </article>
      </div>
      {selected && (
        <Modal title={`${title.replace(/ Orders$/, "")} Details`} onClose={() => setSelected(null)}>
          <div className="flex justify-between text-[13px] text-milk-500">
            <span className="font-semibold text-milk-900">{(selected.customerId && nameById[selected.customerId]) || String(selected[partyKey])}</span>
            <span>
              {selected.date} · {selected.time}
            </span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {selected.items.map((it) => (
              <div key={it.name} className="flex items-center gap-3 rounded-lg border border-milk-200 p-2">
                <ProductImage src={catalog.find((p) => p.name === it.name)?.image} alt={it.name} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-milk-900">{it.name}</p>
                  <p className="text-xs text-milk-500">
                    {inr(it.rate)}/{it.unit} × {it.quantity} {it.unit}
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-milk-900">{inr(it.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <StatusSelect value={selected.status || 'Pending'} options={['Pending', 'Paid']} onChange={(s) => setStatus(selected, s)} />
            <span>
              <span className="font-semibold text-milk-900">Total Net Amount </span>
              <span className="font-bold text-cyan-deep">{inr(selected.total)}</span>
            </span>
          </div>
        </Modal>
      )}
    </div>
  )
}
