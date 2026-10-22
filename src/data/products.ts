import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

export type CatalogProduct = { name: string; unit: string; rate: number; image?: string }

export type ApiProduct = {
  id: string
  name: string
  unit: string
  defaultRate: number
  sellRate?: number
  category?: string
  pack?: string
  image?: string
}

/** This vendor's products (admin: every vendor). */
export function useCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([])

  const load = useCallback(() => {
    api.get<ApiProduct[]>('/products')
      .then((rows) => setProducts(rows.map((r) => ({ name: r.name, unit: r.unit, rate: r.defaultRate / 100, image: r.image }))))
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const addProduct = useCallback(async (p: CatalogProduct) => {
    await api.post('/products', { name: p.name, unit: p.unit, defaultRate: Math.round(p.rate * 100) })
    setProducts((cur) => [...cur, p])
  }, [])

  return { products, addProduct }
}
