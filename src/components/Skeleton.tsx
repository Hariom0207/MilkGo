import { Loader2 } from 'lucide-react'

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-milk-100 ${className}`} />
)

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-milk-500">
      <Loader2 className="size-8 animate-spin text-cyan-mid" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

/** Full page skeleton: header + KPI cards + panels */
export function PageSkeleton() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <Skeleton className="h-7 w-48" /><Skeleton className="h-9 w-64" />
      </div>
      <div className="flex flex-col gap-6 p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )
}
