type PlaceholderProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-[72px] items-center border-b border-milk-200 bg-white px-8">
        <h1 className="text-2xl font-bold text-milk-900">{title}</h1>
      </header>
      <div className="p-8">
        <div className="rounded-2xl border border-dashed border-milk-200 bg-white p-10 text-center text-milk-500">
          {title} screen — wired from Figma nav. Ready to implement next.
        </div>
      </div>
    </div>
  )
}
