import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useCatalog } from '../data/products'
import { displayCustomerCode } from '../lib/customerCode'
import { inr } from '../lib/money'
import { formatPayMethod, monthLabel, monthOf, orderDuePaise, paymentLabel, todayIso } from '../lib/payment'
import { SettlePayment } from '../components/SettlePayment'
import { StatusSelect } from '../components/StatusSelect'
import { PageSkeleton } from '../components/Skeleton'

type Customer = {
  id: string
  name: string
  code?: string
  phone?: string
  address?: string
  email?: string
  type?: string
}

type Order = {
  id: string
  date?: string
  time?: string
  total: number
  amountPaid?: number
  status?: string
  items?: { name: string; quantity: number; unit?: string }[]
}

type Payment = {
  id: string
  code?: string
  amount: number
  appliedAmount?: number
  advanceAmount?: number
  method?: string
  note?: string
  date?: string
  time?: string
  periodFrom?: string | null
  periodTo?: string | null
  collectedByName?: string
  chequeNo?: string | null
  referenceNo?: string | null
  kind?: string
}

type Account = {
  customer: Customer
  summary: { bought: number; paid: number; pending: number; advance?: number; orderCount: number; paymentCount: number }
  orders: Order[]
  payments: Payment[]
}

export function CustomerDetails() {
  const { customerId } = useParams()
  const { products: catalog } = useCatalog()
  const [account, setAccount] = useState<Account | null>(null)
  const [error, setError] = useState('')
  const [month, setMonth] = useState(monthOf())

  const load = async () => {
    if (!customerId) return
    setError('')
    try {
      setAccount(await api.get<Account>(`/customers/${customerId}/account`))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customer ledger')
    }
  }

  useEffect(() => { void load() }, [customerId])

  const monthOrders = useMemo(
    () => (account?.orders ?? []).filter((o) => (o.date || '').startsWith(month)),
    [account, month],
  )
  const monthTotal = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const monthDue = monthOrders.reduce((s, o) => s + orderDuePaise(o), 0)

  const productCols = useMemo(() => {
    const names = [...catalog.map((p) => p.name), ...monthOrders.flatMap((o) => (o.items ?? []).map((i) => i.name))]
    return [...new Set(names)]
  }, [catalog, monthOrders])

  const unitFor = (name: string) => catalog.find((p) => p.name === name)?.unit || ''

  const setOrderStatus = async (order: Order, status: string) => {
    if ((order.status || 'Pending') === status) return
    if (status === 'Paid') return // payment only via SettlePayment
    try {
      await api.patch(`/sales-orders/${order.id}`, { status })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    }
  }

  if (error && !account) {
    return (
      <div className="p-8">
        <Link to="/customers" className="text-sm font-semibold text-cyan-mid">← Customers</Link>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    )
  }
  if (!account) return <PageSkeleton />

  const { customer, summary, payments } = account
  const advance = summary.advance ?? 0
  const cards = [
    { label: 'Total bought', value: inr(summary.bought), hint: `${summary.orderCount} orders` },
    { label: 'Total paid', value: inr(summary.paid), hint: `${summary.paymentCount} receipts` },
    { label: 'Pending due', value: inr(summary.pending), hint: summary.pending ? 'Collect settlement' : 'Settled' },
    { label: advance ? 'Advance' : 'Customer ID', value: advance ? inr(advance) : displayCustomerCode(customer), hint: advance ? 'Credit on account' : customer.type || '—' },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-milk-200 bg-white px-8">
        <Link to="/customers" className="text-sm font-semibold text-cyan-mid">Customers</Link>
        <div>
          <h1 className="text-2xl font-bold text-milk-900">{customer.name}</h1>
          <p className="text-xs text-milk-500">
            {displayCustomerCode(customer)} · ledger · ID {customer.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-8">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-milk-200 bg-white p-4">
              <p className="text-sm text-milk-500">{c.label}</p>
              <p className={`text-lg font-bold ${c.label === 'Pending due' && summary.pending ? 'text-danger' : 'text-milk-900'}`}>{c.value}</p>
              <p className="mt-1 text-xs capitalize text-milk-400">{c.hint}</p>
            </div>
          ))}
        </section>

        <p className="text-sm text-milk-500">
          {[customer.phone, customer.email, customer.address].filter(Boolean).join(' · ') || 'No contact details'}
        </p>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-6">
            <article className="rounded-xl border border-milk-200 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-milk-900">Collect payment</h2>
              <SettlePayment customerId={customer.id} pendingPaise={summary.pending} onDone={load} />
            </article>

            <article className="rounded-xl border border-milk-200 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-milk-900">Payment receipts</h2>
              <ul className="max-h-80 divide-y divide-milk-100 overflow-y-auto text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-cyan-deep">{paymentLabel(p)}</p>
                        <p className="text-milk-900">
                          {p.date || '—'}{p.time ? ` · ${p.time}` : ''} · {formatPayMethod(p.method)}
                        </p>
                        <p className="text-xs text-milk-500">
                          {p.periodFrom && p.periodTo ? `Sales ${p.periodFrom} → ${p.periodTo}` : 'Advance / open'}
                          {p.collectedByName ? ` · by ${p.collectedByName}` : ''}
                          {p.chequeNo ? ` · chq ${p.chequeNo}` : ''}
                          {p.referenceNo ? ` · ref ${p.referenceNo}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-emerald-700">{inr(p.amount)}</p>
                    </div>
                  </li>
                ))}
                {!payments.length && <li className="py-4 text-milk-500">No payments collected yet.</li>}
              </ul>
            </article>
          </div>

          <article className="rounded-xl border border-milk-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-milk-900">Sales</h2>
                <p className="text-xs text-milk-500">{monthLabel(month)} · bought {inr(monthTotal)} · still due {inr(monthDue)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value || monthOf())} className="h-9 rounded-md border border-milk-200 px-2 text-sm outline-none" />
                <Link to="/sales/new" className="rounded-md bg-cyan-mid px-3 py-2 text-[13px] font-semibold text-white">Add sale</Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                    <th className="whitespace-nowrap px-3 py-2">Date</th>
                    <th className="whitespace-nowrap px-3 py-2">Time</th>
                    {productCols.map((name) => (
                      <th key={name} className="whitespace-nowrap px-3 py-2 text-center">{name}</th>
                    ))}
                    <th className="whitespace-nowrap px-3 py-2 text-right">Total</th>
                    <th className="whitespace-nowrap px-3 py-2 text-right">Due</th>
                    <th className="whitespace-nowrap px-3 py-2 text-center">Delivery</th>
                    <th className="whitespace-nowrap px-3 py-2 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {monthOrders.map((row, i) => {
                    const due = orderDuePaise(row)
                    const paidState = due <= 0 ? 'Paid' : due < (Number(row.total) || 0) ? 'Partial' : 'Unpaid'
                    return (
                      <tr key={row.id} className={`border-b border-milk-100 text-[13px] ${i % 2 === 0 ? 'bg-milk-50' : 'bg-white'}`}>
                        <td className="whitespace-nowrap px-3 py-3 text-milk-500">{row.date || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-milk-500">{row.time || '—'}</td>
                        {productCols.map((name) => {
                          const item = (row.items ?? []).find((it) => it.name === name)
                          const unit = item?.unit || unitFor(name)
                          return (
                            <td key={name} className="whitespace-nowrap px-3 py-3 text-center text-milk-900">
                              {item ? `${item.quantity} ${unit}`.trim() : '—'}
                            </td>
                          )
                        })}
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-milk-900">{inr(row.total)}</td>
                        <td className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${due ? 'text-danger' : 'text-emerald-700'}`}>{inr(due)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <StatusSelect
                            value={row.status === 'Paid' ? 'Delivered' : (row.status || 'Pending')}
                            options={['Pending', 'Delivered']}
                            onChange={(s) => setOrderStatus(row, s)}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            paidState === 'Paid' ? 'bg-emerald-50 text-emerald-700'
                              : paidState === 'Partial' ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-danger'
                          }`}>
                            {paidState}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {!monthOrders.length && (
                    <tr>
                      <td colSpan={6 + productCols.length} className="py-8 text-center text-sm text-milk-500">
                        No sales in {monthLabel(month)}.
                      </td>
                    </tr>
                  )}
                </tbody>
                {!!monthOrders.length && (
                  <tfoot>
                    <tr className="border-t border-milk-200 text-sm font-semibold text-milk-900">
                      <td className="px-3 py-3" colSpan={2}>Month total</td>
                      {productCols.map((name) => {
                        const qty = monthOrders.reduce((s, o) => s + (Number((o.items ?? []).find((it) => it.name === name)?.quantity) || 0), 0)
                        return (
                          <td key={name} className="whitespace-nowrap px-3 py-3 text-center">
                            {qty ? `${qty} ${unitFor(name)}`.trim() : '—'}
                          </td>
                        )
                      })}
                      <td className="whitespace-nowrap px-3 py-3 text-right text-cyan-deep">{inr(monthTotal)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-danger">{inr(monthDue)}</td>
                      <td className="px-3 py-3" colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <p className="mt-3 text-xs text-milk-400">
              To clear unpaid rows, use Collect payment with the sale dates (e.g. {todayIso().slice(0, 8)}01 → {todayIso()}).
            </p>
          </article>
        </div>
      </div>
    </div>
  )
}
