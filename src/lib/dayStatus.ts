import type { UserProfile } from './roles'

export type ShortageLine = { name: string; unit: string; missing: number; rate: number }

export type DaySheet = {
  date: string
  staffId: string
  staffName: string
  returned: Record<string, number>
  lines: ShortageLine[]
}

/** Should-return is purchased − sold. Missing is that gap, or stock sold with no purchase, after what came back. */
export function reconcile(purchased: number, sold: number, returned: number) {
  const expected = Math.max(0, purchased - sold)
  const oversold = Math.max(0, sold - purchased)
  const missing = Math.max(0, expected - returned) + Math.max(0, oversold - returned)
  return { expected, oversold, missing }
}

export function booksId(profile: UserProfile) {
  return profile.role === 'staff' ? (profile.vendorId || profile.id) : profile.id
}

const key = (vendorId: string) => `milkgo-day-status:${vendorId}`

export function readSheets(vendorId: string): DaySheet[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key(vendorId)) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function writeSheet(vendorId: string, sheet: DaySheet) {
  const next = readSheets(vendorId).filter((s) => !(s.date === sheet.date && s.staffId === sheet.staffId))
  next.push(sheet)
  localStorage.setItem(key(vendorId), JSON.stringify(next))
  return next
}

export function deduction(lines: ShortageLine[]) {
  return lines.reduce((sum, line) => sum + Math.round(line.missing * line.rate), 0)
}

// ponytail: localStorage until the API has /daily-returns (upsert by date + staffId). Other phones won't see the sheet before that.
export async function loadSheets(vendorId: string) {
  try {
    const { api } = await import('./api')
    const remote = await api.get<DaySheet[]>('/daily-returns')
    if (Array.isArray(remote)) {
      localStorage.setItem(key(vendorId), JSON.stringify(remote))
      return { sheets: remote, shared: true }
    }
  } catch { /* route not deployed */ }
  return { sheets: readSheets(vendorId), shared: false }
}

export async function saveSheet(vendorId: string, sheet: DaySheet) {
  const sheets = writeSheet(vendorId, sheet)
  try {
    const { api } = await import('./api')
    await api.post('/daily-returns', sheet)
    return { sheets, shared: true }
  } catch {
    return { sheets, shared: false }
  }
}
