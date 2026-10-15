import { Package } from 'lucide-react'

export function ProductImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  return src ? (
    <img src={src} alt={alt} className={`${className} rounded-md object-cover`} />
  ) : (
    <span className={`${className} flex items-center justify-center rounded-md bg-milk-50 text-milk-400`}>
      <Package className="size-1/2" />
    </span>
  )
}
