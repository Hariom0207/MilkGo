import { ChevronDown } from 'lucide-react'

const tone: Record<string, string> = {
  pending: 'bg-stock-low-bg text-stock-low',
  Pending: 'bg-stock-low-bg text-stock-low',
  approved: 'bg-stock-in-bg text-stock-in',
  active: 'bg-stock-in-bg text-stock-in',
  Paid: 'bg-cyan-soft text-cyan-deep',
  suspended: 'bg-amber-100 text-warn',
  rejected: 'bg-stock-out-bg text-stock-out',
}

/** Current status as a chip. The control is a dropdown of the allowed statuses. */
export function StatusSelect({ value, options, disabled, onChange }: {
  value: string
  options: readonly string[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <span className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      <select
        aria-label="Status"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-2.5 pr-6 text-xs font-semibold capitalize outline-none disabled:cursor-default ${tone[value] ?? 'bg-milk-100 text-milk-700'}`}
      >
        {options.map((o) => <option key={o} value={o} className="bg-white capitalize text-milk-900">{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 opacity-70" />
    </span>
  )
}
