import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { inr } from '../lib/money'
import { PageSkeleton } from '../components/Skeleton'

type Customer = { id: string; name: string; phone?: string; address?: string; type?: string; gstin?: string; outstandingBalance?: number; totalPurchased?: number }
type Sale = { id: string; total: number; due?: number; items?: { name: string; quantity: number }[] }
type Order = { id: string; date?: string; customerId?: string | null; customerName?: string; total: number; status?: string; items?: { name: string; quantity: number }[] }

export function CustomerDetails() {
  const { customerId } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customerId) return
    Promise.all([
      api.get<Customer>(`/customers/${customerId}`),
      api.get<Sale[]>(`/sales?customerId=${customerId}`),
      api.get<Order[]>('/sales-orders'),
    ]).then(([c, s, o]) => {
      setCustomer(c)
      setSales(s)
      setOrders(o.filter((row) => row.customerId === customerId || row.customerName === c.name))
    }).catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
  }, [customerId])

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!customer) return <PageSkeleton />
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center gap-4 border-b border-milk-200 bg-white px-8">
        <Link to="/customers" className="text-sm font-semibold text-cyan-mid">Customers</Link>
        <h1 className="text-2xl font-bold text-milk-900">{customer.name}</h1>
      </header>
      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[['Type', customer.type || '—'], ['Phone', customer.phone || '—'], ['Purchased', inr(customer.totalPurchased ?? 0)], ['Due', inr(customer.outstandingBalance ?? 0)]].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-milk-200 bg-white p-4"><p className="text-sm text-milk-500">{l}</p><p className="text-lg font-bold capitalize">{v}</p></div>
          ))}
        </section>
        {customer.address && <p className="text-sm text-milk-500">{customer.address}</p>}
        <article className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold">Sales orders</h2>
          <ul className="divide-y divide-milk-100 text-sm">
            {orders.map((s) => (
              <li key={s.id} className="flex justify-between py-2">
                <span>{s.date} · {(s.items ?? []).map((i) => `${i.name} × ${i.quantity}`).join(', ')}</span>
                <span>{inr(s.total)} · {s.status}</span>
              </li>
            ))}
            {!orders.length && <li className="py-4 text-milk-500">No sales orders for this name.</li>}
          </ul>
        </article>
        <article className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold">Billed sales</h2>
          <ul className="divide-y divide-milk-100 text-sm">
            {sales.map((s) => (
              <li key={s.id} className="flex justify-between py-2">
                <span>{(s.items ?? []).map((i) => `${i.name} × ${i.quantity}`).join(', ') || s.id}</span>
                <span>{inr(s.total)} · due {inr(s.due ?? 0)}</span>
              </li>
            ))}
            {!sales.length && <li className="py-4 text-milk-500">No billed sales yet.</li>}
          </ul>
        </article>
      </div>
    </div>
  )
}
