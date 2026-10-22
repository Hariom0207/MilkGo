import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { inr } from '../lib/money'
import { TableSkeleton } from '../components/Skeleton'

type VendorRow = {
  id: string
  name: string
  email: string
  phone: string
  status?: string
  staff: number
  customers: number
  products: number
  salesTotal: number
  purchaseTotal: number
  todaySales: number
}

export function Vendors() {
  const [rows, setRows] = useState<VendorRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<VendorRow[]>('/admin/vendors')
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load vendors'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Vendors</h1>
      </header>
      <div className="p-8">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div className="overflow-x-auto rounded-xl border border-milk-200 bg-white">
          {loading ? <TableSkeleton rows={5} /> : (
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-milk-200 text-milk-500">
                  {['Vendor', 'Status', "Today's sales", 'Total sales', 'Purchases', 'Customers', 'Staff', 'Products', ''].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id} className="border-b border-milk-100">
                    <td className="px-4 py-3 font-medium">{v.name || '—'}<span className="block text-xs font-normal text-milk-500">{v.email}{v.phone ? ` · ${v.phone}` : ''}</span></td>
                    <td className="px-4 py-3 capitalize">{v.status}</td>
                    <td className="px-4 py-3">{inr(v.todaySales)}</td>
                    <td className="px-4 py-3">{inr(v.salesTotal)}</td>
                    <td className="px-4 py-3">{inr(v.purchaseTotal)}</td>
                    <td className="px-4 py-3">{v.customers}</td>
                    <td className="px-4 py-3">{v.staff}</td>
                    <td className="px-4 py-3">{v.products}</td>
                    <td className="px-4 py-3"><Link to={`/admin/vendors/${v.id}`} className="font-semibold text-cyan-mid hover:underline">View</Link></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-milk-500">No vendors yet. A vendor appears after they sign up.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
