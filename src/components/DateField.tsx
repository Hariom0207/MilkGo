import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const toIso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const label = (iso: string) => {
  const d = parseIso(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Props = {
  value: string
  onChange: (iso: string) => void
  className?: string
}

/** Styled date field + popover calendar. Avoids the native browser date picker chrome. */
export function DateField({ value, onChange, className = '' }: Props) {
  const selected = parseIso(value) ?? new Date()
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }, [open, value])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const cells = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const firstWeekday = start.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const prevDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate()
    const out: { iso: string; day: number; outside: boolean }[] = []
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevDays - i
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - 1, day)
      out.push({ iso: toIso(d), day, outside: true })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day)
      out.push({ iso: toIso(d), day, outside: false })
    }
    while (out.length % 7 !== 0 || out.length < 42) {
      const day = out.length - (firstWeekday + daysInMonth) + 1
      const d = new Date(cursor.getFullYear(), cursor.getMonth() + 1, day)
      out.push({ iso: toIso(d), day, outside: true })
    }
    return out
  }, [cursor])

  const today = toIso(new Date())

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[41px] w-full items-center justify-between rounded-lg border border-milk-200 bg-white px-3 text-left text-sm text-milk-900 outline-none hover:border-cyan-mid focus:border-cyan-mid"
      >
        <span className={value ? 'font-medium' : 'text-milk-400'}>{value ? label(value) : 'Select date'}</span>
        <Calendar className="size-4 shrink-0 text-cyan-mid" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[300px] rounded-2xl border border-milk-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-milk-500 hover:bg-milk-50 hover:text-cyan-deep"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-bold text-milk-900">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-milk-500 hover:bg-milk-50 hover:text-cyan-deep"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEK.map((d) => (
              <span key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-milk-400">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const isSelected = cell.iso === value
              const isToday = cell.iso === today
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => { onChange(cell.iso); setOpen(false) }}
                  className={[
                    'flex size-9 items-center justify-center rounded-full text-sm font-medium transition',
                    cell.outside ? 'text-milk-300' : 'text-milk-900',
                    isSelected ? 'bg-cyan-mid text-white shadow-sm' : 'hover:bg-cyan-soft hover:text-cyan-deep',
                    !isSelected && isToday ? 'ring-1 ring-cyan-mid/40' : '',
                  ].join(' ')}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-milk-100 pt-3">
            <button type="button" onClick={() => { onChange(today); setOpen(false) }} className="text-xs font-semibold text-cyan-mid hover:underline">
              Today
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold text-milk-500 hover:text-milk-900">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
