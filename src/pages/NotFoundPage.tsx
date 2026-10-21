import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
      <p className="text-7xl font-bold text-cyan-mid sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-milk-900">Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-milk-500">The page you are looking for doesn't exist or may have been moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-lg border border-milk-200 bg-white px-4 py-2 text-sm font-semibold text-milk-700"><ArrowLeft className="size-4" /> Go Back</button>
        <Link to="/home" className="flex items-center gap-2 rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white"><Home className="size-4" /> Go to Dashboard</Link>
      </div>
    </div>
  )
}
