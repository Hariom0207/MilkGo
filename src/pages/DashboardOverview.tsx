import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Beaker } from 'lucide-react'
import { PageSkeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { inr } from '../lib/money'

type Dash = {
  today: string
  kpis: {
    todaySales: number
    todayPurchases: number
    salesDelta: string
    purchaseDelta: string
    customers: number
    products: number
    staff: number
    vendors: number
    pending: number
  }
  week: { labels: string[]; sales: number[]; purchases: number[] }
  recent: { id: string; party: string; product: string; qty: string; status: string; vendorName: string }[]
  todayProducts: { name: string; quantity: number; unit: string }[]
}

function statusClass(status: string) {
  if (status === 'Paid' || status === 'Delivered') return 'bg-cyan-soft text-cyan-deep'
  if (status === 'Pending') return 'bg-amber-100 text-warn'
  return 'bg-sky-100 text-cyan-mid'
}

function TrendChart({ labels, purchase, sales }: { labels: string[]; purchase: number[]; sales: number[] }) {
  const w = 560
  const h = 180
  const pad = 16
  const max = Math.max(1, ...purchase, ...sales)
  const toPath = (values: number[]) =>
    values.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
      const y = h - pad - (v / max) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i * (h - pad * 2)) / 3
          return <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
        })}
        <path d={toPath(purchase)} fill="none" stroke="#67e8f9" strokeWidth="3" />
        <path d={toPath(sales)} fill="none" stroke="#0891b2" strokeWidth="3" />
      </svg>
      <div className="mt-2 flex justify-between px-2 text-xs text-milk-500">
        {labels.map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
      </div>
    </div>
  )
}

export function DashboardOverview() {
  const { profile } = useAuth()
  const [data, setData] = useState<Dash | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Dash>('/dashboard').then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Dashboard unavailable'))
  }, [])

  if (!data && !error) return <PageSkeleton />
  const k = data?.kpis
  const down = (badge: string) => badge.startsWith('-')
  const cards = k ? [
    { label: "Today's Sales", value: inr(k.todaySales), badge: k.salesDelta, tone: down(k.salesDelta) ? 'down' as const : 'up' as const },
    { label: "Today's Purchase", value: inr(k.todayPurchases), badge: k.purchaseDelta, tone: down(k.purchaseDelta) ? 'down' as const : 'up' as const },
    { label: profile?.role === 'admin' ? 'Vendors' : 'Customers', value: String(profile?.role === 'admin' ? k.vendors : k.customers), badge: `${k.staff} staff`, tone: 'up' as const },
    { label: 'Pending Orders', value: String(k.pending), badge: `${k.products} products`, tone: 'down' as const },
  ] : []
  const top = data?.todayProducts ?? []
  const maxQty = Math.max(1, ...top.map((p) => p.quantity))

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{profile?.role === 'admin' ? 'All vendors' : 'Dashboard'}</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-milk-500">{data?.today}</span>
          {profile?.role === 'admin' && <Link to="/admin/vendors" className="font-semibold text-cyan-mid">Open vendor list</Link>}
          {profile?.role !== 'admin' && <Link to="/sales" className="font-semibold text-cyan-mid">Daily sales</Link>}
        </div>
      </header>
      <div className="flex flex-col gap-6 p-8">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((kpi) => (
            <article key={kpi.label} className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-milk-500">{kpi.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[28px] font-bold leading-none text-milk-900">{kpi.value}</p>
                <span className={['inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold', kpi.tone === 'up' ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger'].join(' ')}>
                  {kpi.tone === 'up' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  {kpi.badge}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="flex flex-col gap-6">
            <article className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-milk-900">Last 7 days</h2>
                <div className="flex items-center gap-4 text-xs text-milk-500">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#67e8f9]" /> Purchase</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-mid" /> Sales</span>
                </div>
              </div>
              {data && <TrendChart labels={data.week.labels} purchase={data.week.purchases} sales={data.week.sales} />}
            </article>
            <article className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-milk-900">Recent sales</h2>
                <Link to="/sales" className="text-sm font-medium text-cyan-mid hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-milk-200 text-milk-500">
                      <th className="pb-3 font-medium">Customer</th>
                      {profile?.role === 'admin' && <th className="pb-3 font-medium">Vendor</th>}
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium">Qty</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recent ?? []).map((row) => (
                      <tr key={row.id} className="border-b border-milk-100 last:border-0">
                        <td className="py-3.5 font-medium text-milk-900">{row.party}</td>
                        {profile?.role === 'admin' && <td className="py-3.5 text-milk-700">{row.vendorName || '—'}</td>}
                        <td className="py-3.5 text-milk-700">{row.product}</td>
                        <td className="py-3.5 text-milk-700">{row.qty}</td>
                        <td className="py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span></td>
                      </tr>
                    ))}
                    {!data?.recent.length && <tr><td colSpan={5} className="py-6 text-center text-milk-500">No sales yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
          <article className="rounded-2xl bg-teal-panel p-6 text-white shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-cyan-soft/90">SOLD TODAY</p>
                <p className="mt-2 text-3xl font-bold">{inr(k?.todaySales ?? 0)}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15"><Beaker className="size-5" /></div>
            </div>
            <ul className="space-y-3">
              {top.map((item) => (
                <li key={item.name} className="rounded-xl bg-white/10 px-3 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <p className="font-semibold">{item.name}</p>
                    <p>{item.quantity} {item.unit}</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white" style={{ width: `${(item.quantity / maxQty) * 100}%` }} />
                  </div>
                </li>
              ))}
              {!top.length && <li className="text-sm text-cyan-soft/80">No products sold today.</li>}
            </ul>
          </article>
        </section>
      </div>
    </div>
  )
}
