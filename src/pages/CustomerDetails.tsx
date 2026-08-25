import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Calendar,
  CalendarPlus,
  ChevronRight,
  Download,
  Funnel,
  House,
  MapPin,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Wallet,
} from 'lucide-react'
import { getCustomer } from '../data/customers'

const rates = [
  { name: 'Standard Toned Milk (500ml)', unit: '500 ml packet', rate: '₹28.00' },
  { name: 'Fresh Thick Curd (400g)', unit: '400 g tub', rate: '₹35.00' },
  { name: 'Premium Ghee (1L Pet Bottle)', unit: '1 L bottle', rate: '₹650.00' },
  { name: 'Soft Paneer (200g Fresh Pack)', unit: '200 g block', rate: '₹85.00' },
  { name: 'Raw Buffalo Milk', unit: '1 Litre Loose', rate: '₹70.00' },
  { name: 'Cream Fat 40%', unit: '1 Kg Pack', rate: '₹380.00' },
  { name: 'Butter (Salted)', unit: '500 g block', rate: '₹260.00' },
  { name: 'Milk Powder (25kg Bag)', unit: '25 kg sack', rate: '₹8,500.00' },
]

const history = [
  { id: '#DF-94829', date: '15 Oct 2023', products: 'Toned Milk x2, Fresh Thick Curd x1', qty: '3 Units', amount: '₹91.00', status: 'PAID' },
  { id: '#DF-94711', date: '14 Oct 2023', products: 'Raw Buffalo Milk x1, Soft Paneer x2', qty: '3 Units', amount: '₹240.00', status: 'PAID' },
  { id: '#DF-94602', date: '13 Oct 2023', products: 'Standard Toned Milk x2, Butter (Salted) x1', qty: '3 Units', amount: '₹316.00', status: 'PAID' },
  { id: '#DF-94510', date: '12 Oct 2023', products: 'Premium Ghee (1L) x1, Toned Milk x1', qty: '2 Units', amount: '₹678.00', status: 'PENDING' },
  { id: '#DF-94401', date: '11 Oct 2023', products: 'Fresh Thick Curd x3', qty: '3 Units', amount: '₹105.00', status: 'PAID' },
  { id: '#DF-94388', date: '10 Oct 2023', products: 'Cream Fat 40% x1, Butter (Salted) x1', qty: '2 Units', amount: '₹640.00', status: 'PENDING' },
]

export function CustomerDetails() {
  const { customerId } = useParams()
  const customer = getCustomer(customerId)

  if (!customer) return <Navigate to="/customers" replace />

  return (
    <div className="flex min-h-full flex-col bg-milk-50 p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-milk-500">
            <Link to="/customers" className="hover:text-cyan-mid">
              Customers
            </Link>
            <ChevronRight className="size-2.5" />
            <span>Customer Profile</span>
          </div>
          <h1 className="mt-1 text-[28px] font-bold text-milk-900">Customer Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-milk-200 bg-white px-4 text-sm font-medium text-milk-700"
          >
            <Pencil className="size-4" />
            Edit Profile
          </button>
          <button
            type="button"
            className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-milk-200 bg-white px-4 text-sm font-medium text-milk-700"
          >
            <PauseCircle className="size-4" />
            Pause Subscription
          </button>
          <button
            type="button"
            className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-cyan-mid px-4 text-sm font-medium text-white"
          >
            <Wallet className="size-4" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-milk-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-cyan-soft text-sm font-bold text-cyan-deep">
                {customer.initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-milk-900">{customer.name}</h2>
                <p className="text-sm text-milk-500">Customer ID: {customer.customerId}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-success">
              Active
            </span>
          </div>
          <div className="my-4 h-px bg-milk-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Meta label="Phone Number" value={customer.phone} icon={Phone} />
            <Meta label="Area" value={customer.area} icon={MapPin} />
            <div className="sm:col-span-2">
              <Meta label="Delivery Address" value={customer.address} icon={House} />
            </div>
            <Meta label="Subscription Frequency" value={customer.frequency} icon={RefreshCw} />
            <Meta label="Assigned Distributor" value={customer.distributor} icon={UserCheck} />
            <Meta label="Join Date" value={customer.joinDate} icon={CalendarPlus} />
          </div>
        </article>

        <article className="rounded-2xl border border-milk-200 bg-white p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-milk-900">Custom Product Rates</h2>
              <p className="text-sm text-milk-500">Assigned contract rates specific to this customer</p>
            </div>
            <button
              type="button"
              className="inline-flex h-[38px] shrink-0 items-center gap-2 rounded-lg border border-milk-200 px-4 text-sm font-medium text-milk-700"
            >
              <Plus className="size-4" />
              Set Custom Rate
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-milk-400">
                <th className="px-3 py-2 font-semibold">Product Name</th>
                <th className="px-3 py-2 font-semibold">Unit</th>
                <th className="px-3 py-2 text-right font-semibold">Rate (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((row) => (
                <tr key={row.name} className="border-t border-milk-100">
                  <td className="px-3 py-2.5 text-milk-800">{row.name}</td>
                  <td className="px-3 py-2.5 text-milk-500">{row.unit}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-cyan-mid">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <article className="mt-6 rounded-2xl border border-milk-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-milk-900">Purchase & Delivery History</h2>
          <p className="text-sm text-milk-500">
            Log of previous orders and automated morning subscription dispatches
          </p>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex h-[38px] w-full max-w-[360px] items-center gap-2 rounded-lg border border-milk-200 bg-white px-4">
            <Search className="size-4 text-milk-400" />
            <input
              type="search"
              placeholder="Search orders by ID or product..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-milk-400"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-milk-200 px-4 text-sm">
              <Funnel className="size-4" />
              All Statuses
            </button>
            <button type="button" className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-milk-200 px-4 text-sm">
              <Calendar className="size-4" />
              Filter Date Range
            </button>
            <button type="button" className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-milk-200 px-4 text-sm">
              <Download className="size-4" />
              Export Ledger
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-milk-400">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Delivery Date</th>
                <th className="px-4 py-3 font-semibold">Products Dispatched</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-milk-100">
                  <td className="px-4 py-3.5 font-semibold text-cyan-mid">{row.id}</td>
                  <td className="px-4 py-3.5 text-milk-700">{row.date}</td>
                  <td className="px-4 py-3.5 text-milk-700">{row.products}</td>
                  <td className="px-4 py-3.5 text-milk-700">{row.qty}</td>
                  <td className="px-4 py-3.5 font-semibold text-milk-900">{row.amount}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={[
                        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase',
                        row.status === 'PAID'
                          ? 'bg-emerald-50 text-success'
                          : 'bg-stock-out-bg text-stock-out',
                      ].join(' ')}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-milk-500">
          <p>Showing 6 of 42 historical records</p>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-milk-200 px-3 py-1.5">
              Previous
            </button>
            <button type="button" className="rounded-lg border border-milk-200 px-3 py-1.5">
              Next
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

function Meta({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Phone
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-milk-400">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="text-sm font-medium text-milk-800">{value}</p>
    </div>
  )
}
