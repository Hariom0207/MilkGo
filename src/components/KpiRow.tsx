import { ArrowDown, ArrowUp } from 'lucide-react'

export type Kpi = {
  label: string
  value: string
  badge: string
  tone: 'up' | 'down'
}

export function KpiRow({ items }: { items: Kpi[] }) {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <article
          key={kpi.label}
          className="rounded-xl border border-milk-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-milk-500">{kpi.label}</p>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <p className="text-[28px] font-bold leading-none text-milk-900">{kpi.value}</p>
            <span
              className={[
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                kpi.tone === 'up' ? 'bg-cyan-soft text-cyan-deep' : 'bg-stock-out-bg text-stock-out',
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
  )
}
