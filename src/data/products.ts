import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import tonedMilk from '../assets/products/toned-milk.png'
import fullCreamMilk from '../assets/products/full-cream-milk.png'
import thickCurd from '../assets/products/thick-curd.png'
import softPaneer from '../assets/products/soft-paneer.png'
import cowGhee from '../assets/products/cow-ghee.png'
import saltedButter from '../assets/products/salted-butter.png'

export type CatalogProduct = { name: string; unit: string; rate: number; image?: string }

// rate in rupees per unit
export const catalog: CatalogProduct[] = [
  { name: 'Standard Toned Milk', unit: 'Pouch', rate: 24, image: tonedMilk },
  { name: 'Full Cream Milk', unit: 'Bottle', rate: 52, image: fullCreamMilk },
  { name: 'Fresh Thick Curd', unit: 'Tub', rate: 34, image: thickCurd },
  { name: 'Soft Paneer Premium', unit: 'Pack', rate: 65, image: softPaneer },
  { name: 'Cow Ghee Jar', unit: 'Jar', rate: 550, image: cowGhee },
  { name: 'Salted Cooking Butter', unit: 'Block', rate: 180, image: saltedButter },
]

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

/** Built-in products plus user-added ones saved in the backend `products` collection. */
export function useCatalog() {
  const [custom, setCustom] = useState<CatalogProduct[]>([])

  useEffect(() => {
    api
      .get<ApiProduct[]>('/products')
      .then((rows) => setCustom(rows.map((r) => ({ name: r.name, unit: r.unit, rate: r.defaultRate / 100, image: r.image }))))
      .catch(() => {})
  }, [])

  const products = useMemo(
    () => [...catalog, ...custom.filter((c) => !catalog.some((b) => b.name === c.name))],
    [custom],
  )

  const addProduct = useCallback(async (p: CatalogProduct) => {
    await api.post('/products', { name: p.name, unit: p.unit, defaultRate: Math.round(p.rate * 100) })
    setCustom((cur) => [...cur, p])
  }, [])

  return { products, addProduct }
}
