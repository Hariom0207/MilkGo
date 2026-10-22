import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { inr } from '../lib/money'
import { PageSkeleton } from '../components/Skeleton'

type Item = { name: string; quantity: number; unit?: string; amount: number }
type Order = { id: string; date?: string; time?: string; customerName?: string; supplierName?: string; items?: Item[]; total: number; status?: string }
type Person = { id: string; name?: string; email?: string; phone?: string; status?: string; role?: string }
type Customer = { id: string; name?: string; phone?: string; address?: string; type?: string; outstandingBalance?: number; totalPurchased?: number }
type Product = { id: string; name?: string; unit?: string; defaultRate?: number }
type Detail = {
  vendor: Person & { status?: string }
  staff: Person[]
  customers: Customer[]
  products: Product[]
  sales: Order[]
  purchases: Order[]
  dailySales: Order[]
  today: string
}

const sum = (rows: Order[]) => rows.reduce((s, r) => s + (r.total || 0), 0)

function Table({ title, rows, party }: { title: string; rows: Order[]; party: 'customerName' | 'supplierName' }) {
  return (
    <article className="rounded-xl border border-milk-200 bg-white p-5">
      <h2 className="mb-3 text-base font-semibold text-milk-900">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-milk-200 text-milk-500">{['Date', 'Party', 'Items', 'Amount', 'Status'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-milk-100">
                <td className="px-3 py-2 text-milk-500">{r.date} {r.time}</td>
                <td className="px-3 py-2">{String(r[party] || '—')}</td>
                <td className="px-3 py-2">{(r.items ?? []).map((i) => `${i.name} × ${i.quantity}`).join(', ') || '—'}</td>
                <td className="px-3 py-2">{inr(r.total || 0)}</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-milk-500">None</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export function VendorDetail() {
  const { vendorId } = useParams()
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!vendorId) return
    api.get<Detail>(`/admin/vendors/${vendorId}`).then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
  }, [vendorId])

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!data) return <PageSkeleton />
  const v = data.vendor
  const cards = [
    ["Today's sales", inr(sum(data.dailySales))],
    ['Total sales', inr(sum(data.sales))],
    ['Purchases', inr(sum(data.purchases))],
    ['Customers', String(data.customers.length)],
    ['Staff', String(data.staff.length)],
    ['Products', String(data.products.length)],
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center gap-4 border-b border-milk-200 bg-white px-8">
        <Link to="/admin/vendors" className="text-sm font-semibold text-cyan-mid">Vendors</Link>
        <h1 className="text-2xl font-bold text-milk-900">{v.name || 'Vendor'}</h1>
        <span className="text-sm capitalize text-milk-500">{v.status} · {v.email}</span>
      </header>
      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-milk-200 bg-white p-4">
              <p className="text-sm text-milk-500">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </section>
        <Table title={`Daily sales · ${data.today}`} rows={data.dailySales} party="customerName" />
        <Table title="All sales" rows={data.sales} party="customerName" />
        <Table title="Purchases" rows={data.purchases} party="supplierName" />
        <article className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold">Customers</h2>
          <ul className="divide-y divide-milk-100 text-sm">
            {data.customers.map((c) => <li key={c.id} className="flex justify-between py-2"><span>{c.name}<span className="ml-2 text-milk-500">{c.phone} · {c.type}</span></span><span>{inr(c.outstandingBalance ?? 0)} due</span></li>)}
            {!data.customers.length && <li className="py-4 text-milk-500">No customers</li>}
          </ul>
        </article>
        <article className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold">Staff</h2>
          <ul className="divide-y divide-milk-100 text-sm">
            {data.staff.map((s) => <li key={s.id} className="py-2">{s.name} <span className="text-milk-500">{s.email} · {s.status}</span></li>)}
            {!data.staff.length && <li className="py-4 text-milk-500">No staff</li>}
          </ul>
        </article>
        <article className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold">Products</h2>
          <ul className="divide-y divide-milk-100 text-sm">
            {data.products.map((p) => <li key={p.id} className="flex justify-between py-2"><span>{p.name}</span><span>{inr(p.defaultRate ?? 0)}/{p.unit}</span></li>)}
            {!data.products.length && <li className="py-4 text-milk-500">No products</li>}
          </ul>
        </article>
      </div>
    </div>
  )
}
