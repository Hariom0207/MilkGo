import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '../components/ProductImage'
import { Modal } from '../components/Modal'
import { ProductForm } from '../components/ProductForm'
import { api } from '../lib/api'
import type { ApiProduct } from '../data/products'
import { LayoutGrid, List, Plus, Search } from 'lucide-react'
import tonedMilk from '../assets/products/toned-milk.png'
import fullCreamMilk from '../assets/products/full-cream-milk.png'
import thickCurd from '../assets/products/thick-curd.png'
import softPaneer from '../assets/products/soft-paneer.png'
import cowGhee from '../assets/products/cow-ghee.png'
import saltedButter from '../assets/products/salted-butter.png'

const categories = [
  'All Products',
  'Milk',
  'Curd',
  'Paneer',
  'Butter',
  'Ghee',
  'Cream',
  'Buttermilk',
] as const

type StockTone = 'in' | 'low' | 'out'

type Product = {
  id: string
  category: string
  name: string
  pack: string
  sku: string
  image: string
  raw?: ApiProduct
  stockLabel: string
  stockTone: StockTone
  buy: string
  sell: string
  margin: string
}

const builtIn: Product[] = [
  {
    id: 'MILK-TON-500',
    category: 'Milk',
    name: 'Standard Toned Milk',
    pack: '500ml Pouch',
    sku: 'MILK-TON-500',
    image: tonedMilk,
    stockLabel: 'In Stock (1,250)',
    stockTone: 'in',
    buy: '₹24.00',
    sell: '₹28.00',
    margin: '14.3%',
  },
  {
    id: 'MILK-CRM-1000',
    category: 'Milk',
    name: 'Full Cream Milk',
    pack: '1L Pet Bottle',
    sku: 'MILK-CRM-1000',
    image: fullCreamMilk,
    stockLabel: 'In Stock (840)',
    stockTone: 'in',
    buy: '₹52.00',
    sell: '₹64.00',
    margin: '18.7%',
  },
  {
    id: 'CURD-THK-400',
    category: 'Curd',
    name: 'Fresh Thick Curd',
    pack: '400g Tub',
    sku: 'CURD-THK-400',
    image: thickCurd,
    stockLabel: 'Low Stock (145)',
    stockTone: 'low',
    buy: '₹34.00',
    sell: '₹45.00',
    margin: '24.4%',
  },
  {
    id: 'PAN-SFT-200',
    category: 'Paneer',
    name: 'Soft Paneer Premium',
    pack: '200g Fresh Pack',
    sku: 'PAN-SFT-200',
    image: softPaneer,
    stockLabel: 'In Stock (410)',
    stockTone: 'in',
    buy: '₹65.00',
    sell: '₹85.00',
    margin: '23.5%',
  },
  {
    id: 'GHEE-COW-1000',
    category: 'Ghee',
    name: 'Cow Ghee Jar',
    pack: '1L Tin Jar',
    sku: 'GHEE-COW-1000',
    image: cowGhee,
    stockLabel: 'Out of Stock',
    stockTone: 'out',
    buy: '₹550.00',
    sell: '₹690.00',
    margin: '20.3%',
  },
  {
    id: 'BUTR-SLT-500',
    category: 'Butter',
    name: 'Salted Cooking Butter',
    pack: '500g Block',
    sku: 'BUTR-SLT-500',
    image: saltedButter,
    stockLabel: 'In Stock (380)',
    stockTone: 'in',
    buy: '₹180.00',
    sell: '₹220.00',
    margin: '18.1%',
  },
]

const inr = (paise: number) => `₹${(paise / 100).toFixed(2)}`

function fromApi(r: ApiProduct): Product {
  const sell = r.sellRate ?? 0
  return {
    id: r.id,
    raw: r,
    category: r.category ?? 'Other',
    name: r.name,
    pack: r.pack || r.unit,
    sku: r.id.slice(0, 8).toUpperCase(),
    image: r.image ?? '',
    stockLabel: 'New Product',
    stockTone: 'in',
    buy: inr(r.defaultRate),
    sell: sell ? inr(sell) : '-',
    margin: sell ? `${(((sell - r.defaultRate) / sell) * 100).toFixed(1)}%` : '-',
  }
}

function stockClass(tone: StockTone) {
  if (tone === 'low') return 'bg-stock-low-bg text-stock-low'
  if (tone === 'out') return 'bg-stock-out-bg text-stock-out'
  return 'bg-stock-in-bg text-stock-in'
}

function StockBadge({ product }: { product: Product }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockClass(product.stockTone)}`}
    >
      {product.stockLabel}
    </span>
  )
}

export function ProductsCatalog() {
  const [added, setAdded] = useState<Product[]>([])
  useEffect(() => {
    api
      .get<ApiProduct[]>('/products')
      .then((rows) => setAdded(rows.map(fromApi)))
      .catch(() => {})
  }, [])
  const products = useMemo(
    () => [...builtIn, ...added.filter((a) => !builtIn.some((b) => b.name === a.name))],
    [added],
  )
  const [selected, setSelected] = useState<Product | null>(null)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All Products')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = category === 'All Products' || product.category === category
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.pack.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [category, query, products])

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center justify-between border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">Products Catalog</h1>
        <div className="flex items-center gap-4">
          <label className="flex h-8 w-[220px] items-center gap-2 rounded-lg border border-milk-200 bg-milk-50 px-3">
            <Search className="size-4 shrink-0 text-milk-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Quick search..."
              className="w-full bg-transparent text-[13px] text-milk-900 outline-none placeholder:text-milk-400"
            />
          </label>
          <Link
            to="/products/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-cyan-mid px-4 text-[13px] font-semibold text-white shadow-sm"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add Product
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const active = item === category
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={[
                    'rounded-lg border px-4 py-2 text-[13px] font-semibold',
                    active
                      ? 'border-cyan-mid bg-cyan-mid text-white shadow-sm'
                      : 'border-milk-200 bg-white text-milk-500 hover:bg-milk-50',
                  ].join(' ')}
                >
                  {item}
                </button>
              )
            })}
          </div>
          <div className="flex gap-1 rounded-lg border border-milk-200 bg-white p-1">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView('grid')}
              className={`flex size-7 items-center justify-center rounded-md ${
                view === 'grid' ? 'bg-milk-50 text-cyan-mid' : 'text-milk-400'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView('list')}
              className={`flex size-7 items-center justify-center rounded-md ${
                view === 'list' ? 'bg-milk-50 text-cyan-mid' : 'text-milk-400'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-milk-200 bg-white p-10 text-center text-milk-500">
            No products match this search.
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <article
                key={product.id}
                onClick={() => setSelected(product)}
                className="cursor-pointer overflow-hidden rounded-2xl border border-milk-200 bg-white shadow-sm"
              >
                <div className="h-[150px] overflow-clip">
                  <ProductImage src={product.image} alt={product.name} className="size-full" />
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase text-milk-400">
                        {product.category}
                      </p>
                      <StockBadge product={product} />
                    </div>
                    <h2 className="truncate text-[15px] font-bold text-milk-800">{product.name}</h2>
                    <p className="text-xs text-milk-500">
                      {product.pack} • SKU: {product.sku}
                    </p>
                  </div>
                  <div className="h-px bg-milk-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-milk-500">Buy / Sell</p>
                      <p className="text-[13px] font-semibold text-milk-800">
                        {product.buy} / <span className="font-bold text-sell">{product.sell}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-milk-500">Margin</p>
                      <span className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-bold text-stock-in">
                        {product.margin}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-milk-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-milk-200 text-milk-500">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Buy / Sell</th>
                  <th className="px-5 py-3 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id} onClick={() => setSelected(product)} className="cursor-pointer hover:bg-milk-50 border-b border-milk-100 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-clip rounded-lg">
                          <ProductImage src={product.image} alt="" className="size-full" />
                        </div>
                        <div>
                          <p className="font-semibold text-milk-800">{product.name}</p>
                          <p className="text-xs text-milk-500">{product.pack}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-milk-700">{product.sku}</td>
                    <td className="px-5 py-3">
                      <StockBadge product={product} />
                    </td>
                    <td className="px-5 py-3 font-semibold text-milk-800">
                      {product.buy} / <span className="text-sell">{product.sell}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-stock-in">{product.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <Modal
          title={editing ? 'Edit Product' : 'Product Details'}
          onClose={() => {
            setSelected(null)
            setEditing(false)
          }}
        >
          {editing && selected.raw ? (
            <ProductForm
              initial={selected.raw}
              submitLabel="Save Changes"
              onSave={async (payload) => {
                const id = selected.id
                await api.patch(`/products/${id}`, { ...payload, pack: payload.pack || undefined })
                setAdded((cur) => cur.map((a) => (a.id === id ? fromApi({ ...payload, id }) : a)))
                setSelected(null)
                setEditing(false)
              }}
            />
          ) : (
            <>
              <div className="h-[220px] overflow-clip rounded-xl">
                <ProductImage src={selected.image} alt={selected.name} className="size-full" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase text-milk-400">{selected.category}</p>
                <h2 className="text-lg font-bold text-milk-800">{selected.name}</h2>
                <p className="text-xs text-milk-500">
                  {selected.pack} • SKU: {selected.sku}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[13px]">
                <div>
                  <p className="text-[11px] text-milk-500">Buy</p>
                  <p className="font-semibold text-milk-800">{selected.buy}</p>
                </div>
                <div>
                  <p className="text-[11px] text-milk-500">Sell</p>
                  <p className="font-bold text-sell">{selected.sell}</p>
                </div>
                <div>
                  <p className="text-[11px] text-milk-500">Margin</p>
                  <p className="font-bold text-stock-in">{selected.margin}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StockBadge product={selected} />
                {selected.raw ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg bg-cyan-mid px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Edit
                  </button>
                ) : (
                  <span className="text-xs text-milk-400">Built-in product (read-only)</span>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
