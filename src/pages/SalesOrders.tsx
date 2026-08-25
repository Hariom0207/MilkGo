import { Link } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import { KpiRow } from '../components/KpiRow'
import { StatusBadge } from '../components/StatusBadge'

const kpis = [
  { label: "Today's Sales", value: '₹1,84,350', badge: '+12.4%', tone: 'up' as const },
  { label: 'Remaining', value: '₹2,45,820', badge: '+8.2%', tone: 'up' as const },
  { label: 'Missing', value: '142', badge: '+3 New', tone: 'up' as const },
  { label: 'Pending Orders', value: '28', badge: '-5%', tone: 'down' as const },
]

const rows = [
  {
    date: '21 Aug 2026',
    party: 'Ganga Dairy Co.',
    paneer: '120 Kg',
    curd: '-',
    ghee: '-',
    total: '120 Kg',
    rate: '₹420/Kg',
    amount: '₹50,400',
    status: 'Paid',
  },
  {
    date: '20 Aug 2026',
    party: 'Yamuna Dairy Pvt Ltd',
    paneer: '-',
    curd: '2,400 Cups',
    ghee: '-',
    total: '2,400 Cups',
    rate: '₹18/Cup',
    amount: '₹43,200',
    status: 'Pending',
  },
  {
    date: '19 Aug 2026',
    party: 'Saraswati Ghee Works',
    paneer: '-',
    curd: '-',
    ghee: '80 Kg',
    total: '80 Kg',
    rate: '₹1,120/Kg',
    amount: '₹89,600',
    status: 'Paid',
  },
  {
    date: '18 Aug 2026',
    party: 'Butter & Cream Co.',
    paneer: '-',
    curd: '-',
    ghee: '-',
    total: '45 Kg',
    rate: '₹980/Kg',
    amount: '₹44,100',
    status: 'Pending',
  },
  {
    date: '17 Aug 2026',
    party: 'Dairy Hub Pvt Ltd',
    paneer: '-',
    curd: '-',
    ghee: '-',
    total: '12 Bags',
    rate: '₹6,250/Bag',
    amount: '₹75,000',
    status: 'Paid',
  },
]

export function SalesOrders() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Sales Orders</h1>
        <Link
          to="/sales/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-cyan-mid px-3 text-[13px] font-semibold text-white"
        >
          <Plus className="size-4" />
          Add Order
        </Link>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <KpiRow items={kpis} />

        <article className="rounded-xl border border-milk-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-milk-900">Monthly Sales List</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-milk-200 bg-milk-50 px-3 py-2 text-[13px] font-semibold text-milk-900"
            >
              <Download className="size-4" />
              Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Customer Name</th>
                  <th className="py-2 text-center font-semibold">
                    Paneer (Fresh)
                    <span className="block text-[11px] font-normal">Qty</span>
                  </th>
                  <th className="py-2 text-center font-semibold">
                    Curd (Cup)
                    <span className="block text-[11px] font-normal">Qty</span>
                  </th>
                  <th className="py-2 text-center font-semibold">
                    Ghee (Pure)
                    <span className="block text-[11px] font-normal">Qty</span>
                  </th>
                  <th className="py-2 text-right font-semibold">Total Qty</th>
                  <th className="py-2 text-right font-semibold">Rate</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                  <th className="py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.date}
                    className={`border-b border-milk-200 text-[13px] ${i % 2 === 0 ? 'bg-milk-50' : 'bg-white'}`}
                  >
                    <td className="py-3 text-milk-500">{row.date}</td>
                    <td className="py-3 font-medium text-milk-900">{row.party}</td>
                    <td className="py-3 text-center text-milk-900">{row.paneer}</td>
                    <td className="py-3 text-center text-milk-500">{row.curd}</td>
                    <td className="py-3 text-center text-milk-500">{row.ghee}</td>
                    <td className="py-3 text-right text-milk-900">{row.total}</td>
                    <td className="py-3 text-right text-milk-500">{row.rate}</td>
                    <td className="py-3 text-right font-semibold text-milk-900">{row.amount}</td>
                    <td className="py-3 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  )
}
