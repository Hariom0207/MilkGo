import { X } from 'lucide-react'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-4 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-milk-900">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-milk-500">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
