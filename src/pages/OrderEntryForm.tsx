import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, Plus, Trash2, X } from 'lucide-react'

const factories = ['Apex Dairy Farms Ltd.', 'Ganga Dairy Co.', 'Yamuna Dairy Pvt Ltd']
const catalog = [
  { name: 'Raw Buffalo Milk', rate: '₹420/Kg' },
  { name: 'Cream Fat 40%', rate: '₹420/Kg' },
  { name: 'Standard Toned Milk', rate: '₹28/Pouch' },
  { name: 'Fresh Thick Curd', rate: '₹35/Tub' },
]

type LineItem = {
  product: string
  qty: string
  rate: string
}

const emptyItem: LineItem = { product: '', qty: '', rate: '' }

function parseAmount(value: string) {
  const n = Number(value.replace(/[₹,/A-Za-z]/g, '').trim())
  return Number.isFinite(n) ? n : 0
}

function formatInr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

type OrderEntryFormProps = {
  pageTitle: string
  formTitle: string
  partyLabel: string
  backTo: string
}

export function OrderEntryForm({
  pageTitle,
  formTitle,
  partyLabel,
  backTo,
}: OrderEntryFormProps) {
  const navigate = useNavigate()
  const [factory, setFactory] = useState(factories[0])
  const [date, setDate] = useState('2025-05-24')
  const [items, setItems] = useState<LineItem[]>([
    { product: 'Raw Buffalo Milk', qty: '2500', rate: '₹420/Kg' },
    { product: 'Cream Fat 40%', qty: '300', rate: '₹420/Kg' },
    emptyItem,
  ])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parseAmount(item.qty) * parseAmount(item.rate), 0),
    [items],
  )

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function resetForm() {
    setFactory(factories[0])
    setDate('2025-05-24')
    setItems([
      { product: 'Raw Buffalo Milk', qty: '2500', rate: '₹420/Kg' },
      { product: 'Cream Fat 40%', qty: '300', rate: '₹420/Kg' },
      emptyItem,
    ])
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{pageTitle}</h1>
      </header>

      <div className="p-8">
        <form
          className="flex flex-col gap-5 rounded-xl border border-milk-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(backTo)
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

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">
              {partyLabel}
            </span>
            <span className="relative">
              <select
                value={factory}
                onChange={(e) => setFactory(e.target.value)}
                className="h-[41px] w-full appearance-none rounded-lg border border-milk-200 bg-white px-3 pr-10 text-sm text-milk-900 outline-none"
              >
                {factories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-milk-400" />
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">
              Procurement Date
            </span>
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

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-milk-500">
              Items Details
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <span className="relative">
                    <select
                      value={item.product}
                      onChange={(e) => {
                        const match = catalog.find((p) => p.name === e.target.value)
                        updateItem(index, {
                          product: e.target.value,
                          rate: match?.rate ?? item.rate,
                        })
                      }}
                      className="h-9 w-full appearance-none rounded-md border border-milk-200 bg-white px-2.5 pr-8 text-[13px] text-milk-900 outline-none"
                    >
                      <option value="">Select item</option>
                      {catalog.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-milk-400" />
                  </span>
                  <input
                    value={item.qty}
                    onChange={(e) => updateItem(index, { qty: e.target.value })}
                    placeholder="Qty"
                    className="h-9 rounded-md border border-milk-200 px-2.5 text-[13px] text-milk-900 outline-none placeholder:text-milk-400"
                  />
                  <input
                    value={item.rate}
                    onChange={(e) => updateItem(index, { rate: e.target.value })}
                    placeholder="Rate"
                    className="h-9 rounded-md border border-milk-200 px-2.5 text-[13px] text-milk-900 outline-none placeholder:text-milk-400"
                  />
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    className="self-start text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setItems((current) => [...current, emptyItem])}
              className="inline-flex items-center gap-1 self-start py-1 text-[13px] font-semibold text-cyan-mid"
            >
              <Plus className="size-3.5" />
              Add Another Item
            </button>
          </div>

          <div className="rounded-lg bg-milk-50 p-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-milk-500">Subtotal</span>
              <span className="font-semibold text-milk-900">{formatInr(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-milk-500">Tax/Transport</span>
              <span className="font-semibold text-milk-900">₹0.00</span>
            </div>
            <div className="my-2 h-px bg-milk-200" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-milk-900">Total Net Amount</span>
              <span className="font-bold text-cyan-deep">{formatInr(subtotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 py-3.5 text-sm font-bold text-white"
          >
            Submit Order
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-lg border border-milk-200 py-3.5 text-sm font-semibold text-milk-500"
          >
            Reset Form
          </button>
        </form>
      </div>
    </div>
  )
}
