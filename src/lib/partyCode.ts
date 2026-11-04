/** Readable party id shown in UI. Firestore doc id stays the internal key. */
export const nextCustomerCode = () => `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
export const nextSupplierCode = () => `SP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export const displayPartyCode = (c: { code?: string; id?: string } | null | undefined) =>
  c?.code || (c?.id ? c.id.slice(0, 8).toUpperCase() : '—')

/** @deprecated use displayPartyCode */
export const displayCustomerCode = displayPartyCode
