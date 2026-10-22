import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { booksId, deduction, loadSheets, type DaySheet } from '../lib/dayStatus'
import { inr } from '../lib/money'
import type { UserProfile } from '../lib/roles'
import { PageSkeleton } from '../components/Skeleton'

const monthNow = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7)
const qtyText = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))

export function Distributors() {
  const { profile } = useAuth()
  const [month, setMonth] = useState(monthNow())
  const [staff, setStaff] = useState<UserProfile[]>([])
  const [sheets, setSheets] = useState<DaySheet[]>([])
  const [shared, setShared] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const path = profile.role === 'admin' ? '/admin/users' : '/team/staff'
    Promise.all([
      api.get<UserProfile[]>(path).catch(() => []),
      loadSheets(booksId(profile)),
    ]).then(([people, stored]) => {
      setStaff(people.filter((p) => p.role === 'staff'))
      setSheets(stored.sheets)
      setShared(stored.shared)
    }).finally(() => setLoading(false))
  }, [profile])

  const lines = sheets
    .filter((s) => s.date.startsWith(month))
    .flatMap((s) => s.lines.map((line) => ({ ...line, date: s.date, staffId: s.staffId, staffName: s.staffName })))

  const ids = [...new Set([...staff.map((s) => s.id), ...lines.map((l) => l.staffId)])]
  const nameOf = (id: string) => staff.find((s) => s.id === id)?.name || lines.find((l) => l.staffId === id)?.staffName || 'Distributor'

  if (loading) return <PageSkeleton />

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Distributors</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-milk-200 px-3 py-2 text-sm" />
      </header>
      <div className="flex flex-col gap-6 p-8">
        {!shared && <p className="text-sm text-milk-500">Missing-stock sheets saved on this browser are listed here.</p>}
        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-milk-900">Salary deduction</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                <th className="px-3 py-2">Distributor</th>
                <th className="px-3 py-2 text-right">Deduct this month</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id) => {
                const cut = deduction(lines.filter((l) => l.staffId === id))
                return (
                  <tr key={id} className="border-b border-milk-100">
                    <td className="px-3 py-3 font-medium text-milk-900">{nameOf(id)}</td>
                    <td className={`px-3 py-3 text-right font-semibold ${cut ? 'text-danger' : ''}`}>{inr(cut)}</td>
                  </tr>
                )
              })}
              {!ids.length && <tr><td colSpan={2} className="px-3 py-6 text-center text-milk-400">No distributors yet. Add staff under My Staff.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-milk-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-milk-900">Missing product sheet</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-milk-200 text-xs font-semibold text-milk-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Distributor</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Missing</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={`${line.date}-${line.staffId}-${line.name}-${i}`} className="border-b border-milk-100">
                  <td className="px-3 py-3 text-milk-500">{line.date}</td>
                  <td className="px-3 py-3">{line.staffName}</td>
                  <td className="px-3 py-3">{line.name}</td>
                  <td className="px-3 py-3 text-right">{qtyText(line.missing)} {line.unit}</td>
                  <td className="px-3 py-3 text-right">{inr(Math.round(line.missing * line.rate))}</td>
                </tr>
              ))}
              {!lines.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-milk-400">No missing stock this month.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
