import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { nextCustomerCode, nextSupplierCode } from '../lib/partyCode'
import { isValidPhone, sanitizePhone, PHONE_ERROR } from '../lib/phone'
import { useCatalog } from '../data/products'
import { DateField } from '../components/DateField'
import { ProductImage } from '../components/ProductImage'
import { Modal } from '../components/Modal'

type LineItem = { name: string; qty: string }
type Party = { id?: string; name: string; code?: string }

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
const formatInr = (value: number) => `₹${value.toLocaleString('en-IN')}`
const inputCls = 'h-[41px] w-full rounded-lg border border-milk-200 bg-white px-3 text-sm text-milk-900 outline-none placeholder:text-milk-400'

type OrderEntryFormProps = {
  pageTitle: string
  formTitle: string
  partyLabel: string
  backTo: string
  endpoint?: string
  parties: string[]
  partiesEndpoint?: string
  partyKey: string
}

export function OrderEntryForm({ pageTitle, formTitle, partyLabel, backTo, endpoint, parties, partiesEndpoint, partyKey }: OrderEntryFormProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isCustomer = partyKey === 'customerName'
  const isSupplier = partyKey === 'supplierName'
  const needsPartyId = isCustomer || isSupplier
  const partyNoun = isSupplier ? 'supplier' : 'customer'
  const { products: catalog, addProduct } = useCatalog()
  const [partyList, setPartyList] = useState<Party[]>(parties.map((name) => ({ name })))
  const [selected, setSelected] = useState<Party | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [np, setNp] = useState({ name: '', unit: '', rate: '' })
  const [date, setDate] = useState(today())
  const [items, setItems] = useState<LineItem[]>([])
  const [picking, setPicking] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newParty, setNewParty] = useState(false)
  const [partyForm, setPartyForm] = useState({
    code: isSupplier ? nextSupplierCode() : nextCustomerCode(),
    name: '',
    phone: '',
    address: '',
    type: 'retailer' as 'retailer' | 'walkin',
  })
  const [phoneError, setPhoneError] = useState('')
  const [creating, setCreating] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!partiesEndpoint) return
    api.get<{ id?: string; name?: string; code?: string }[]>(partiesEndpoint)
      .then((rows) => setPartyList(rows.filter((r) => r.name).map((r) => ({ id: r.id, name: r.name!, code: r.code }))))
      .catch(() => {})
  }, [partiesEndpoint])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return partyList
    return partyList.filter((p) => p.name.toLowerCase().includes(q) || (p.code ?? '').toLowerCase().includes(q) || (p.id ?? '').toLowerCase().includes(q))
  }, [partyList, query])

  const exactMatch = partyList.find((p) => p.name.toLowerCase() === query.trim().toLowerCase())
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
  const partyReady = needsPartyId ? !!selected?.id : !!selected?.name || !!query.trim()
  const partyName = selected?.name || query.trim()
  const valid = partyReady && lines.length > 0 && lines.every((l) => l.qty > 0)

  function toggle(name: string) {
    setItems((cur) =>
      cur.some((i) => i.name === name) ? cur.filter((i) => i.name !== name) : [...cur, { name, qty: '' }],
    )
  }

  function resetForm() {
    setSelected(null)
    setQuery('')
    setDate(today())
    setItems([])
    setError('')
  }

  function pick(p: Party) {
    setSelected(p)
    setQuery(p.name)
    setOpen(false)
    setError('')
  }

  function openAddParty(seed = '') {
    setPartyForm({
      code: isSupplier ? nextSupplierCode() : nextCustomerCode(),
      name: seed,
      phone: '',
      address: '',
      type: 'retailer',
    })
    setPhoneError('')
    setNewParty(true)
    setOpen(false)
  }

  async function createParty(e: React.FormEvent) {
    e.preventDefault()
    if (!partyForm.name.trim()) return
    if (partyForm.phone && !isValidPhone(partyForm.phone)) { setPhoneError(PHONE_ERROR); return }
    setCreating(true)
    setError('')
    try {
      const path = isSupplier ? '/suppliers' : '/customers'
      const code = partyForm.code.trim() || (isSupplier ? nextSupplierCode() : nextCustomerCode())
      const body = isSupplier
        ? { name: partyForm.name.trim(), code, phone: partyForm.phone, address: partyForm.address }
        : { name: partyForm.name.trim(), code, phone: partyForm.phone, address: partyForm.address, type: partyForm.type }
      const created = await api.post<Party & { id: string }>(path, body)
      const party = { id: created.id, name: created.name || partyForm.name.trim(), code: created.code || code }
      setPartyList((cur) => [...cur, party])
      pick(party)
      setNewParty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to add ${partyNoun}`)
    } finally {
      setCreating(false)
    }
  }

  async function confirm() {
    if (!endpoint) return navigate(backTo)
    if (needsPartyId && !selected?.id) {
      setError(`Select a ${partyNoun} from the list, or add a new ${partyNoun}.`)
      setReviewing(false)
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post(endpoint, {
        [partyKey]: partyName,
        ...(isCustomer ? { customerId: selected!.id } : {}),
        ...(isSupplier ? { supplierId: selected!.id } : {}),
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
            if (needsPartyId && !selected?.id) {
              setError(query.trim() && !exactMatch
                ? `No ${partyNoun} with that name. Add a new ${partyNoun} from the list.`
                : `Select a ${partyNoun} from the list, or add a new ${partyNoun}.`)
              setOpen(true)
              return
            }
            if (valid) setReviewing(true)
            else setError(needsPartyId ? `Select a ${partyNoun}, add at least one product and a quantity for each.` : 'Enter a name, add at least one product and a quantity for each.')
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-milk-900">{formTitle}</h2>
            <button type="button" aria-label="Close" onClick={() => navigate(backTo)} className="flex size-6 items-center justify-center rounded-xl bg-milk-50 text-milk-500">
              <X className="size-3.5" />
            </button>
          </div>
          <div className="h-px bg-milk-200" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5" ref={box}>
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">{partyLabel}</span>
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelected(null)
                    setOpen(true)
                    setError('')
                  }}
                  onFocus={() => setOpen(true)}
                  placeholder={needsPartyId ? `Search ${partyNoun} by name or id` : 'Select or type name'}
                  autoComplete="off"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" aria-label="Open list" onClick={() => setOpen((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-milk-400 hover:text-milk-700">
                  <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-milk-200 bg-white py-1 shadow-lg">
                    {filtered.map((p) => (
                      <button
                        key={p.id || p.name}
                        type="button"
                        onClick={() => pick(p)}
                        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-cyan-soft ${selected?.id === p.id || selected?.name === p.name ? 'bg-cyan-soft' : ''}`}
                      >
                        <span className="font-medium text-milk-900">{p.name}</span>
                        {needsPartyId && <span className="font-mono text-xs text-milk-400">{p.code || (p.id ? p.id.slice(0, 8).toUpperCase() : '')}</span>}
                      </button>
                    ))}
                    {!filtered.length && (
                      <p className="px-3 py-2 text-sm text-milk-400">{query.trim() ? 'No match found' : `No ${partyNoun}s yet`}</p>
                    )}
                    {needsPartyId && (
                      <button
                        type="button"
                        onClick={() => openAddParty(query.trim())}
                        className="flex w-full items-center gap-2 border-t border-milk-100 px-3 py-2.5 text-left text-sm font-semibold text-cyan-mid hover:bg-milk-50"
                      >
                        <Plus className="size-3.5" />
                        {query.trim() && !exactMatch ? `Add “${query.trim()}” as new ${partyNoun}` : `Add new ${partyNoun}`}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {selected?.id && needsPartyId && (
                <p className="text-xs text-milk-500">{isSupplier ? 'Supplier' : 'Customer'} ID: <span className="font-mono font-semibold text-milk-700">{selected.code || selected.id.slice(0, 8).toUpperCase()}</span></p>
              )}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">{isCustomer ? 'Sale Date' : 'Procurement Date'}</span>
              <DateField value={date} onChange={setDate} />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-milk-500">Items Details</p>
              <button type="button" onClick={() => setPicking(true)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-cyan-mid">
                <Plus className="size-3.5" />
                {items.length ? 'Add / Edit Items' : 'Add Item'}
              </button>
            </div>
            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed border-milk-200 py-6 text-center text-[13px] text-milk-400">No items added yet</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {lines.map((l) => (
                  <div key={l.name} className="flex items-center gap-3 rounded-lg border border-milk-200 p-2">
                    <ProductImage src={l.p.image} alt={l.name} className="size-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-milk-900">{l.name}</p>
                      <p className="text-xs text-milk-500">{formatInr(l.p.rate)}/{l.p.unit}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={l.qty || ''}
                      onChange={(e) => setItems((cur) => cur.map((i) => (i.name === l.name ? { ...i, qty: e.target.value } : i)))}
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
            <button type="button" onClick={resetForm} className="rounded-lg border border-milk-200 py-3 text-sm font-semibold text-milk-500">Reset Form</button>
            <button type="submit" className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white">Submit Order</button>
          </div>
        </form>
      </div>

      {newParty && (
        <Modal title={`Add new ${partyNoun}`} narrow onClose={() => setNewParty(false)}>
          <form onSubmit={createParty} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">{isSupplier ? 'Supplier' : 'Customer'} ID</span>
              <input required value={partyForm.code} onChange={(e) => setPartyForm({ ...partyForm, code: e.target.value.toUpperCase() })} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Name</span>
              <input required value={partyForm.name} onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })} placeholder={`${isSupplier ? 'Supplier' : 'Customer'} name`} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Phone</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={partyForm.phone}
                onChange={(e) => {
                  const p = sanitizePhone(e.target.value)
                  setPartyForm({ ...partyForm, phone: p })
                  setPhoneError(p && !isValidPhone(p) ? PHONE_ERROR : '')
                }}
                placeholder="10-digit mobile no."
                className={`${inputCls} ${phoneError ? 'border-red-400' : ''}`}
              />
              {phoneError && <p className="text-xs text-danger">{phoneError}</p>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Address</span>
              <input value={partyForm.address} onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })} placeholder="Address" className={inputCls} />
            </label>
            {isCustomer && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-milk-500">Type</span>
                <select value={partyForm.type} onChange={(e) => setPartyForm({ ...partyForm, type: e.target.value as 'retailer' | 'walkin' })} className={inputCls}>
                  <option value="retailer">Retailer</option>
                  <option value="walkin">Walk-in</option>
                </select>
              </label>
            )}
            {error && <p className="text-[13px] text-danger">{error}</p>}
            <button disabled={creating} className="rounded-lg bg-cyan-mid px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {creating ? 'Saving…' : `Save ${partyNoun}`}
            </button>
          </form>
        </Modal>
      )}

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
                  className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center ${on ? 'border-cyan-mid bg-cyan-soft' : 'border-milk-200'}`}
                >
                  {on && <Check className="absolute right-2 top-2 size-4 text-cyan-deep" />}
                  <ProductImage src={p.image} alt={p.name} className="size-20" />
                  <span className="text-[13px] font-semibold text-milk-900">{p.name}</span>
                  <span className="text-xs text-milk-500">{formatInr(p.rate)}/{p.unit}</span>
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
            <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-cyan-mid">
              <Plus className="size-3.5" />
              New Product
            </button>
          ))}
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <button type="button" onClick={() => setPicking(false)} className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white">
            Done ({items.length} selected)
          </button>
        </Modal>
      )}

      {reviewing && (
        <Modal title="Review Order" onClose={() => setReviewing(false)}>
          <div className="flex justify-between text-[13px] text-milk-500">
            <span>
              {partyName}
              {selected?.code || selected?.id ? ` · ${selected.code || selected.id!.slice(0, 8).toUpperCase()}` : ''}
            </span>
            <span>{date}</span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {lines.map((l) => (
              <div key={l.name} className="flex items-center gap-3 rounded-lg border border-milk-200 p-2">
                <ProductImage src={l.p.image} alt={l.name} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-milk-900">{l.name}</p>
                  <p className="text-xs text-milk-500">{formatInr(l.p.rate)}/{l.p.unit} × {l.qty}</p>
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
            <button type="button" onClick={() => setReviewing(false)} className="rounded-lg border border-milk-200 py-3 text-sm font-semibold text-milk-500">Back</button>
            <button type="button" disabled={saving} onClick={confirm} className="rounded-lg bg-cyan-500 py-3 text-sm font-bold text-white disabled:opacity-60">
              {saving ? 'Saving…' : 'Confirm & Submit'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
