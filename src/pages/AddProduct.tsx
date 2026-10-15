import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import { ProductForm } from '../components/ProductForm'

export function AddProduct() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-[72px] shrink-0 items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Products Catalog</h1>
      </header>
      <div className="p-6">
        <div className="flex flex-col gap-4 rounded-xl border border-milk-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-milk-900">Add Product</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => navigate('/products')}
              className="flex size-6 items-center justify-center rounded-xl bg-milk-50 text-milk-500"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="h-px bg-milk-200" />
          <ProductForm
            submitLabel="Save Product"
            onSave={async (payload) => {
              await api.post('/products', { ...payload, pack: payload.pack || undefined })
              navigate('/products')
            }}
          />
        </div>
      </div>
    </div>
  )
}
