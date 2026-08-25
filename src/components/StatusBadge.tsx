type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const paid = status.toLowerCase() === 'paid'
  return (
    <span
      className={[
        'inline-flex rounded-md px-2 py-1 text-[11px] font-semibold',
        paid ? 'bg-cyan-soft text-cyan-deep' : 'bg-stock-low-bg text-stock-low',
      ].join(' ')}
    >
      {status}
    </span>
  )
}
