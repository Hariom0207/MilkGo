import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Check, ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../data/products'
import { ProductImage } from '../components/ProductImage'
import { Modal } from '../components/Modal'

type LineItem = { name: string; qty: string }

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
const formatInr = (value: number) => `₹${value.toLocaleString('en-IN')}`

type OrderEntryFormProps = {
  pageTitle: string
  formTitle: string
  partyLabel: string
  backTo: string
  /** When set, the reviewed order is POSTed here before navigating back. */
  endpoint?: string
  parties: string[]
  /** Load party names from this API list (`{ name }[]`). Typed names still save. */
  partiesEndpoint?: string
  /** Field name the selected party is saved under. */
  partyKey: string
}

export function OrderEntryForm({ pageTitle, formTitle, partyLabel, backTo, endpoint, parties, partiesEndpoint, partyKey }: OrderEntryFormProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { products: catalog, addProduct } = useCatalog()
  const [partyList, setPartyList] = useState<{ id?: string; name: string }[]>(parties.map((name) => ({ name })))
  const partyNames = partyList.map((p) => p.name)
  const [adding, setAdding] = useState(false)
  const [np, setNp] = useState({ name: '', unit: '', rate: '' })
  const [factory, setFactory] = useState('')
  const [date, setDate] = useState(today())
  const [items, setItems] = useState<LineItem[]>([])
  const [picking, setPicking] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!partiesEndpoint) return
    api.get<{ id?: string; name?: string }[]>(partiesEndpoint)
      .then((rows) => setPartyList(rows.filter((r) => r.name).map((r) => ({ id: r.id, name: r.name! }))))
      .catch(() => {})
  }, [partiesEndpoint])

  const lines = useMemo(
    () =>
      items.map((i) => {
        const p = catalog.find((c) => c.name === i.name) ?? { name: i.name, unit: '', rate: 0 }
        const qty = Number(i.qty) || 0
        return { ...i, p, qty, amount: qty * p.rate }
      }),
    [items, catalog],
  )
  const total = lines.reduce((sum, l) => sum + l.amount, 0)
  const valid = factory.trim() !== '' && lines.length > 0 && lines.every((l) => l.qty > 0)

  function toggle(name: string) {
    setItems((cur) =>
      cur.some((i) => i.name === name) ? cur.filter((i) => i.name !== name) : [...cur, { name, qty: '' }],
    )
  }

  function resetForm() {
    setFactory('')
    setDate(today())
    setItems([])
    setError('')
  }

  async function confirm() {
    if (!endpoint) return navigate(backTo)
    setSaving(true)
    setError('')
    try {
      await api.post(endpoint, {
        [partyKey]: factory,
        ...(partyKey === 'customerName' ? { customerId: partyList.find((p) => p.name === factory)?.id ?? null } : {}),
        date,
        time: new Date().toTimeString().slice(0, 5),
        items: lines.map((l) => ({
          name: l.name,
          unit: l.p.unit,
          quantity: l.qty,
          rate: Math.round(l.p.rate * 100),
          amount: Math.round(l.amount * 100),
        })),
        total: Math.round(total * 100),
      })
      navigate(backTo)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-[72px] shrink-0 items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{pageTitle}</h1>
      </header>

      <div className="p-6">
        <form
          className="flex flex-col gap-4 rounded-xl border border-milk-200 bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            if (valid) setReviewing(true)
            else setError('Enter a name, add at least one product and a quantity for each.')
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-milk-900">{formTitle}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => navigate(backTo)}
              className="flex size-6 items-center justify-center rounded-xl bg-milk-50 text-milk-500"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="h-px bg-milk-200" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">{partyLabel}</span>
              <span className="relative">
                <input
                  list="party-options"
                  value={factory}
                  onChange={(e) => setFactory(e.target.value)}
                  placeholder="Select or type name"
                  className="h-[41px] w-full rounded-lg border border-milk-200 bg-white px-3 pr-10 text-sm text-milk-900 outline-none placeholder:text-milk-400"
                />
                <datalist id="party-options">
                  {partyNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-milk-400" />
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Procurement Date</span>
              <span className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-[41px] w-full rounded-lg border border-milk-200 bg-white px-3 pr-10 text-sm text-milk-900 outline-none"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-milk-400" />
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-milk-500">Items Details</p>
              <button
                type="button"
                onClick={() => setPicking(true)}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-cyan-mid"
              >
                <Plus className="size-3.5" />
                {items.length ? 'Add / Edit Items' : 'Add Item'}
              </button>
            </div>
            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed border-milk-200 py-6 text-center text-[13px] text-milk-400">
                No items added yet
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {lines.map((l) => (
                  <div key={l.name} className="flex items-center gap-3 rounded-lg border border-milk-200 p-2">
                    <ProductImage src={l.p.image} alt={l.name} className="size-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-milk-900">{l.name}</p>
                      <p className="text-xs text-milk-500">
                        {formatInr(l.p.rate)}/{l.p.unit}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={l.qty || ''}
                      onChange={(e) =>
                        setItems((cur) => cur.map((i) => (i.name === l.name ? { ...i, qty: e.target.value } : i)))
                      }
                      placeholder="Qty"
                      className="h-9 w-20 rounded-md border border-milk-200 px-2.5 text-[13px] text-milk-900 outline-none placeholder:text-milk-400"
                    />
                    <button type="button" aria-label="Remove item" onClick={() => toggle(l.name)} className="text-danger">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-milk-50 p-3 text-sm">
            <span className="font-semibold text-milk-900">Total Net Amount</span>
            <span className="font-bold text-cyan-deep">{formatInr(total)}</span>
          </div>

          {error && <p className="text-[13px] text-danger">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-milk-200 py-3 text-sm font-semibold text-milk-500"
            >
              Reset Form
            </button>
            <button type="submit" className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white">
              Submit Order
            </button>
          </div>
        </form>
      </div>

      {picking && (
        <Modal title="Select Products" onClose={() => setPicking(false)}>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {catalog.map((p) => {
              const on = items.some((i) => i.name === p.name)
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => toggle(p.name)}
                  className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center ${
                    on ? 'border-cyan-mid bg-cyan-soft' : 'border-milk-200'
                  }`}
                >
                  {on && <Check className="absolute right-2 top-2 size-4 text-cyan-deep" />}
                  <ProductImage src={p.image} alt={p.name} className="size-20" />
                  <span className="text-[13px] font-semibold text-milk-900">{p.name}</span>
                  <span className="text-xs text-milk-500">
                    {formatInr(p.rate)}/{p.unit}
                  </span>
                </button>
              )
            })}
          </div>
          {profile?.role !== 'staff' && (adding ? (
            <div className="grid grid-cols-3 gap-2">
              {(['name', 'unit', 'rate'] as const).map((k) => (
                <input
                  key={k}
                  value={np[k]}
                  type={k === 'rate' ? 'number' : 'text'}
                  onChange={(e) => setNp({ ...np, [k]: e.target.value })}
                  placeholder={k === 'name' ? 'Product name' : k === 'unit' ? 'Unit (Kg, Pouch…)' : 'Rate (₹)'}
                  className="h-9 rounded-md border border-milk-200 px-2.5 text-[13px] outline-none placeholder:text-milk-400"
                />
              ))}
              <button
                type="button"
                disabled={!np.name.trim() || !np.unit.trim() || !(Number(np.rate) >= 0) || np.rate === ''}
                onClick={async () => {
                  const name = np.name.trim()
                  if (catalog.some((c) => c.name.toLowerCase() === name.toLowerCase())) return setError('Product already exists')
                  try {
                    await addProduct({ name, unit: np.unit.trim(), rate: Number(np.rate) })
                    toggle(name)
                    setNp({ name: '', unit: '', rate: '' })
                    setAdding(false)
                    setError('')
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to add product')
                  }
                }}
                className="col-span-3 rounded-lg border border-cyan-mid py-2 text-[13px] font-semibold text-cyan-mid disabled:opacity-50"
              >
                Save Product
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-cyan-mid"
            >
              <Plus className="size-3.5" />
              New Product
            </button>
          ))}
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <button
            type="button"
            onClick={() => setPicking(false)}
            className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white"
          >
            Done ({items.length} selected)
          </button>
        </Modal>
      )}

      {reviewing && (
        <Modal title="Review Order" onClose={() => setReviewing(false)}>
          <div className="flex justify-between text-[13px] text-milk-500">
            <span>{factory}</span>
            <span>{date}</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {lines.map((l) => (
              <div key={l.name} className="flex items-center gap-3 rounded-lg border border-milk-200 p-2">
                <ProductImage src={l.p.image} alt={l.name} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-milk-900">{l.name}</p>
                  <p className="text-xs text-milk-500">
                    {formatInr(l.p.rate)}/{l.p.unit} × {l.qty}
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-milk-900">{formatInr(l.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-milk-900">Total Net Amount</span>
            <span className="font-bold text-cyan-deep">{formatInr(total)}</span>
          </div>
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="rounded-lg border border-milk-200 py-3 text-sm font-semibold text-milk-500"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={confirm}
              className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Confirm & Submit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
