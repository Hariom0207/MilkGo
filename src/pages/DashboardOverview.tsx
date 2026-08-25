import {
  ArrowDown,
  ArrowUp,
  Bell,
  Beaker,
  Search,
} from 'lucide-react'

const kpis = [
  {
    label: "Today's Purchase",
    value: '₹1,84,350',
    badge: '+12.4%',
    tone: 'up' as const,
  },
  {
    label: "Today's Sales",
    value: '₹2,45,820',
    badge: '+8.2%',
    tone: 'up' as const,
  },
  {
    label: 'Active Distributors',
    value: '142',
    badge: '+3 New',
    tone: 'up' as const,
  },
  {
    label: 'Pending Orders',
    value: '28',
    badge: '-5%',
    tone: 'down' as const,
  },
]

const orders = [
  {
    id: 'DF-ORD-8841',
    party: 'Mother Dairy Agency',
    product: 'Milk 1L (Cow)',
    qty: '450 Pkts',
    status: 'Delivered',
  },
  {
    id: 'DF-ORD-8840',
    party: 'Amulya Distributors',
    product: 'Paneer 200g',
    qty: '120 Pkts',
    status: 'Pending',
  },
  {
    id: 'DF-ORD-8839',
    party: 'Verka Retailers',
    product: 'Curd 400ml',
    qty: '300 Pkts',
    status: 'In Transit',
  },
  {
    id: 'DF-ORD-8838',
    party: 'Apna Bazaar',
    product: 'Butter 100g',
    qty: '80 Pkts',
    status: 'Delivered',
  },
]

const collection = [
  { name: 'Cow Milk', liters: '6,200 Ltrs', fat: '4.2% Fat' },
  { name: 'Buffalo Milk', liters: '4,850 Ltrs', fat: '6.8% Fat' },
  { name: 'Mixed/Standard', liters: '1,400 Ltrs', fat: '4.5% Fat' },
]

const topProducts = [
  { name: 'Milk 1L Cow', value: '4,500 Ltrs', width: '92%', color: '#67e8f9' },
  { name: 'Milk 500ml Cow', value: '3,200 Ltrs', width: '72%', color: '#22d3ee' },
  { name: 'Paneer 200g', value: '1,200 Kg', width: '48%', color: '#fb923c' },
  { name: 'Curd 400ml', value: '950 Ltrs', width: '38%', color: '#f87171' },
  { name: 'Butter 100g', value: '600 Kg', width: '28%', color: '#a78bfa' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const purchasePoints = [42, 55, 48, 70, 62, 80, 74]
const salesPoints = [38, 50, 58, 64, 78, 72, 88]

function statusClass(status: string) {
  if (status === 'Delivered') return 'bg-cyan-soft text-cyan-deep'
  if (status === 'Pending') return 'bg-amber-100 text-warn'
  return 'bg-sky-100 text-cyan-mid'
}

function TrendChart() {
  const w = 560
  const h = 180
  const pad = 16
  const toPath = (values: number[]) =>
    values
      .map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / (values.length - 1)
        const y = h - pad - (v / 100) * (h - pad * 2)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i * (h - pad * 2)) / 3
          return (
            <line
              key={i}
              x1={pad}
              x2={w - pad}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          )
        })}
        <path d={toPath(purchasePoints)} fill="none" stroke="#67e8f9" strokeWidth="3" />
        <path d={toPath(salesPoints)} fill="none" stroke="#0891b2" strokeWidth="3" />
      </svg>
      <div className="mt-2 flex justify-between px-2 text-xs text-milk-500">
        {weekDays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  )
}

export function DashboardOverview() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Dashboard Overview</h1>
        <div className="flex items-center gap-5">
          <label className="flex h-[34px] w-[280px] items-center gap-2 rounded-full border border-milk-200 bg-milk-50 px-4">
            <Search className="size-[18px] text-milk-400" />
            <input
              type="search"
              placeholder="Search transactions, stock..."
              className="w-full bg-transparent text-sm text-milk-900 outline-none placeholder:text-milk-400"
            />
          </label>
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full border border-milk-200 bg-white"
            aria-label="Notifications"
          >
            <Bell className="size-5 text-milk-500" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-cyan-soft px-3 py-1.5 text-xs font-semibold text-cyan-deep">
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-mid" />
            Live Procurement
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-milk-500">{kpi.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[28px] font-bold leading-none text-milk-900">{kpi.value}</p>
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                    kpi.tone === 'up'
                      ? 'bg-emerald-50 text-success'
                      : 'bg-red-50 text-danger',
                  ].join(' ')}
                >
                  {kpi.tone === 'up' ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )}
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
                <h2 className="text-base font-semibold text-milk-900">
                  Weekly Milk Trend (Liters)
                </h2>
                <div className="flex items-center gap-4 text-xs text-milk-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#67e8f9]" /> Purchase
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-mid" /> Sales
                  </span>
                </div>
              </div>
              <TrendChart />
            </article>

            <article className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-milk-900">
                  Recent Distribution Orders
                </h2>
                <button type="button" className="text-sm font-medium text-cyan-mid hover:underline">
                  View All Orders →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-milk-200 text-milk-500">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer/Distributor</th>
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium">Qty</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((row) => (
                      <tr key={row.id} className="border-b border-milk-100 last:border-0">
                        <td className="py-3.5 font-medium text-milk-900">{row.id}</td>
                        <td className="py-3.5 text-milk-700">{row.party}</td>
                        <td className="py-3.5 text-milk-700">{row.product}</td>
                        <td className="py-3.5 text-milk-700">{row.qty}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <div className="flex flex-col gap-6">
            <article className="rounded-2xl bg-teal-panel p-6 text-white shadow-sm">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-cyan-soft/90">
                    TOTAL PROCURED TODAY
                  </p>
                  <p className="mt-2 text-3xl font-bold">12,450 Ltrs</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                  <Beaker className="size-5" />
                </div>
              </div>
              <ul className="space-y-3">
                {collection.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-cyan-soft/80">{item.fat}</p>
                    </div>
                    <p className="text-sm font-semibold">{item.liters}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-milk-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-milk-900">
                Top Products by Vol (Today)
              </h2>
              <ul className="space-y-4">
                {topProducts.map((product) => (
                  <li key={product.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-milk-700">{product.name}</span>
                      <span className="text-milk-500">{product.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-milk-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: product.width, backgroundColor: product.color }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
