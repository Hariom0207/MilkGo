import { useState } from 'react'
import { api } from '../lib/api'
import { inr } from '../lib/money'
import {
  PAY_METHODS,
  confirmAmountText,
  nowTime,
  rupeesToPaise,
  todayIso,
  type PayMethod,
} from '../lib/payment'

type Quote = {
  due: number
  orderCount: number
  orderIds: string[]
  periodFrom: string
  periodTo: string
  orders: { id: string; date?: string; total: number; due: number }[]
}

type Props = {
  customerId: string
  pendingPaise: number
  onDone: () => void
}

const inputCls = 'h-[41px] w-full rounded-lg border border-milk-200 bg-white px-3 text-sm text-milk-900 outline-none'

export function SettlePayment({ customerId, pendingPaise, onDone }: Props) {
  const [periodFrom, setPeriodFrom] = useState(todayIso())
  const [periodTo, setPeriodTo] = useState(todayIso())
  const [quote, setQuote] = useState<Quote | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PayMethod>('cash')
  const [date, setDate] = useState(todayIso())
  const [time, setTime] = useState(nowTime())
  const [note, setNote] = useState('')
  const [chequeNo, setChequeNo] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [allowAdvance, setAllowAdvance] = useState(false)
  const [error, setError] = useState('')
  const [quoting, setQuoting] = useState(false)
  const [saving, setSaving] = useState(false)

  const quotePeriod = async () => {
    setError('')
    setQuoting(true)
    try {
      if (periodTo < periodFrom) throw new Error('End date must be on or after start date')
      const q = await api.post<Quote>('/payments/quote', { customerId, periodFrom, periodTo })
      setQuote(q)
      setAmount(q.due ? (q.due / 100).toFixed(2) : '')
      setAllowAdvance(q.due === 0)
    } catch (err) {
      setQuote(null)
      setError(err instanceof Error ? err.message : 'Could not calculate dues')
    } finally {
      setQuoting(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quote) { setError('Calculate dues for the period first'); return }
    const rupees = Number(amount)
    if (!Number.isFinite(rupees) || rupees <= 0) { setError('Enter a valid amount'); return }
    const paise = rupeesToPaise(rupees)
    if (paise > quote.due && !allowAdvance) {
      setError(`Amount is more than period due ${inr(quote.due)}. Tick advance to continue.`)
      return
    }
    if (method === 'cheque' && !chequeNo.trim()) { setError('Enter cheque number'); return }

    const ok = window.confirm(
      `${confirmAmountText(quote.due, paise)}\nPeriod ${quote.periodFrom} → ${quote.periodTo}\nMethod: ${method.toUpperCase()}\n\nConfirm collect payment?`,
    )
    if (!ok) return

    setSaving(true)
    setError('')
    try {
      await api.post('/payments', {
        customerId,
        amount: paise,
        method,
        date,
        time,
        periodFrom: quote.periodFrom,
        periodTo: quote.periodTo,
        orderIds: quote.orderIds,
        allowAdvance: allowAdvance || paise > quote.due,
        note: note.trim() || undefined,
        chequeNo: method === 'cheque' ? chequeNo.trim() : undefined,
        referenceNo: referenceNo.trim() || undefined,
      })
      setQuote(null)
      setAmount('')
      setNote('')
      setChequeNo('')
      setReferenceNo('')
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-sm text-milk-500">
        Customer pays for a sale period (e.g. day 1–5). Calculate dues, confirm amount, then collect.
      </p>
      <p className="text-xs text-milk-400">Account pending: {inr(pendingPaise)}</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">From (sale date)</span>
          <input type="date" required value={periodFrom} onChange={(e) => { setPeriodFrom(e.target.value); setQuote(null) }} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">To (sale date)</span>
          <input type="date" required value={periodTo} onChange={(e) => { setPeriodTo(e.target.value); setQuote(null) }} className={inputCls} />
        </label>
      </div>

      <button type="button" disabled={quoting} onClick={quotePeriod} className="rounded-lg border border-cyan-mid px-3 py-2 text-sm font-semibold text-cyan-mid disabled:opacity-60">
        {quoting ? 'Calculating…' : 'Calculate period due'}
      </button>

      {quote && (
        <div className="rounded-lg border border-milk-200 bg-milk-50 p-3 text-sm">
          <p className="font-semibold text-milk-900">
            Due for {quote.periodFrom} → {quote.periodTo}: {inr(quote.due)}
          </p>
          <p className="text-xs text-milk-500">{quote.orderCount} unpaid sale(s) in this period</p>
          {quote.due === 0 && <p className="mt-1 text-xs text-amber-700">Nothing unpaid in range — you can still take advance.</p>}
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Collect amount (₹)</span>
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={quote ? `Due ${inr(quote.due)}` : 'Calculate dues first'}
          className={inputCls}
          disabled={!quote}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-milk-700">
        <input type="checkbox" checked={allowAdvance} onChange={(e) => setAllowAdvance(e.target.checked)} />
        Allow advance (amount above period due)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value as PayMethod)} className={inputCls}>
            {PAY_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Collected on</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Time</span>
          <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Ref / UTR</span>
          <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="Optional" className={inputCls} />
        </label>
      </div>

      {method === 'cheque' && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Cheque no.</span>
          <input required value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className={inputCls} />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" className={inputCls} />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button disabled={saving || !quote} className="rounded-lg bg-cyan-mid px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Saving…' : 'Confirm & collect'}
      </button>
    </form>
  )
}
