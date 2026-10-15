import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import { api } from '../lib/api'

const categories = ['Milk', 'Curd', 'Paneer', 'Butter', 'Ghee', 'Cream', 'Buttermilk']

// Downscale to keep the Firestore document small.
function resizeToDataUrl(file: File, max = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => reject(new Error('Invalid image'))
    img.src = URL.createObjectURL(file)
  })
}

const inputCls =
  'h-[41px] w-full rounded-lg border border-milk-200 bg-white px-3 text-sm text-milk-900 outline-none placeholder:text-milk-400'
const labelCls = 'text-xs font-semibold uppercase tracking-wide text-milk-500'

export function AddProduct() {
  const navigate = useNavigate()
  const [image, setImage] = useState('')
  const [f, setF] = useState({ name: '', category: categories[0], pack: '', unit: '', buy: '', sell: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!image) return setError('Please add a product image.')
    setSaving(true)
    setError('')
    try {
      await api.post('/products', {
        name: f.name.trim(),
        unit: f.unit.trim(),
        category: f.category,
        ...(f.pack.trim() ? { pack: f.pack.trim() } : {}),
        defaultRate: Math.round(Number(f.buy) * 100),
        ...(f.sell ? { sellRate: Math.round(Number(f.sell) * 100) } : {}),
        image,
      })
      navigate('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-[72px] shrink-0 items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Products Catalog</h1>
      </header>
      <div className="p-6">
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-milk-200 bg-white p-5 shadow-sm">
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr]">
            <label className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-milk-200 bg-milk-50 text-[13px] text-milk-400">
              {image ? (
                <img src={image} alt="Preview" className="size-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="size-8" />
                  Upload image
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) setImage(await resizeToDataUrl(file).catch(() => ''))
                }}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className={labelCls}>Product Name</span>
                <input required value={f.name} onChange={set('name')} placeholder="e.g. Fresh Buttermilk" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Category</span>
                <select value={f.category} onChange={set('category')} className={inputCls}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Pack Size</span>
                <input value={f.pack} onChange={set('pack')} placeholder="e.g. 500ml Pouch" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Unit</span>
                <input required value={f.unit} onChange={set('unit')} placeholder="Kg, Pouch, Jar…" className={inputCls} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Buy Rate (₹)</span>
                  <input required type="number" min="0" step="0.01" value={f.buy} onChange={set('buy')} className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Sell Rate (₹)</span>
                  <input type="number" min="0" step="0.01" value={f.sell} onChange={set('sell')} className={inputCls} />
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-[13px] text-danger">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
