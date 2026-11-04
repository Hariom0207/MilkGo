import { inr } from './money'

export type PayMethod = 'cash' | 'upi' | 'bank' | 'cheque'

export const PAY_METHODS: { value: PayMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI / Online' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cheque', label: 'Cheque' },
]

export const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

export const nowTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())

export const monthOf = (iso = todayIso()) => iso.slice(0, 7)

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100)

export const orderDuePaise = (o: { total?: number; amountPaid?: number; status?: string }) => {
  const total = Number(o.total) || 0
  const paid = Number(o.amountPaid) || (o.status === 'Paid' ? total : 0)
  return Math.max(0, total - paid)
}

export const paymentLabel = (p: { code?: string; id?: string }) => p.code || (p.id ? p.id.slice(0, 8).toUpperCase() : '—')

export const formatPayMethod = (m?: string) => PAY_METHODS.find((x) => x.value === m)?.label || m || '—'

export const confirmAmountText = (duePaise: number, payPaise: number) => {
  if (payPaise === duePaise) return `Full settlement ${inr(duePaise)}`
  if (payPaise < duePaise) return `Partial ${inr(payPaise)} of ${inr(duePaise)} due`
  return `Settle ${inr(duePaise)} + advance ${inr(payPaise - duePaise)}`
}
