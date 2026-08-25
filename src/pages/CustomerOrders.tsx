import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { KpiRow } from '../components/KpiRow'
import { StatusBadge } from '../components/StatusBadge'
import { customers } from '../data/customers'

const kpis = [
  { label: "Today's Purchase", value: '₹1,84,350', badge: '+12.4%', tone: 'up' as const },
  { label: 'Monthly Purchase', value: '₹2,45,820', badge: '+8.2%', tone: 'up' as const },
  { label: 'Active Distributors', value: '142', badge: '+3 New', tone: 'up' as const },
  { label: 'Pending Orders', value: '28', badge: '-5%', tone: 'down' as const },
]

const rows = [
  { date: '21 Aug 2026', customerId: 'ganga-dairy', p1: '120 Kg', p2: '0', p3: '0', rate: '₹420/Kg', amount: '₹50,400', status: 'Paid' },
  { date: '20 Aug 2026', customerId: 'yamuna-dairy', p1: '2,400', p2: '0', p3: '0', rate: '₹18/Cup', amount: '₹43,200', status: 'Pending' },
  { date: '19 Aug 2026', customerId: 'saraswati-ghee', p1: '80 Kg', p2: '0', p3: '0', rate: '₹1,120/Kg', amount: '₹89,600', status: 'Paid' },
  { date: '18 Aug 2026', customerId: 'butter-cream', p1: '45 Kg', p2: '0', p3: '0', rate: '₹980/Kg', amount: '₹44,100', status: 'Pending' },
  { date: '17 Aug 2026', customerId: 'dairy-hub', p1: '12', p2: '0', p3: '0', rate: '₹6,250/Bag', amount: '₹75,000', status: 'Paid' },
]

export function CustomerOrders() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Customer Orders</h1>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <KpiRow items={kpis} />

        <article className="rounded-xl border border-milk-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-milk-900">Monthly Customer List</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-milk-200 bg-milk-50 px-3 py-2 text-[13px] font-semibold text-milk-900"
            >
              <Download className="size-4" />
              Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-milk-200 bg-milk-50 text-[13px] font-semibold text-milk-500">
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Customer Name</th>
                  <th className="px-3 py-2.5 font-semibold">P1</th>
                  <th className="px-3 py-2.5 font-semibold">P2</th>
                  <th className="px-3 py-2.5 font-semibold">P3</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Rate</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const customer = customers.find((c) => c.id === row.customerId)
                  return (
                    <tr
                      key={row.customerId}
                      className={`border-b border-milk-200 text-[13px] ${i % 2 === 0 ? 'bg-milk-50' : 'bg-white'}`}
                    >
                      <td className="px-3 py-2.5 text-milk-500">{row.date}</td>
                      <td className="px-3 py-2.5">
                        <Link
                          to={`/customers/${row.customerId}`}
                          className="font-medium text-milk-900 hover:text-cyan-mid hover:underline"
                        >
                          {customer?.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-milk-900">{row.p1}</td>
                      <td className="px-3 py-2.5 text-milk-900">{row.p2}</td>
                      <td className="px-3 py-2.5 text-milk-900">{row.p3}</td>
                      <td className="px-3 py-2.5 text-right text-milk-500">{row.rate}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-milk-900">
                        {row.amount}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  )
}
