import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import type { ApiProduct } from '../data/products'

export const categories = ['Milk', 'Curd', 'Paneer', 'Butter', 'Ghee', 'Cream', 'Buttermilk']

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

export type ProductPayload = Omit<ApiProduct, 'id'>

type ProductFormProps = {
  initial?: ApiProduct
  submitLabel: string
  onSave: (payload: ProductPayload) => Promise<void>
}

export function ProductForm({ initial, submitLabel, onSave }: ProductFormProps) {
  const [image, setImage] = useState(initial?.image ?? '')
  const [f, setF] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? categories[0],
    pack: initial?.pack ?? '',
    unit: initial?.unit ?? '',
    buy: initial ? String(initial.defaultRate / 100) : '',
    sell: initial?.sellRate ? String(initial.sellRate / 100) : '',
  })
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
      await onSave({
        name: f.name.trim(),
        unit: f.unit.trim(),
        category: f.category,
        pack: f.pack.trim(),
        defaultRate: Math.round(Number(f.buy) * 100),
        ...(f.sell ? { sellRate: Math.round(Number(f.sell) * 100) } : {}),
        image,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 overflow-y-auto">
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
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
