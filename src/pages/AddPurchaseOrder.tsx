import { OrderEntryForm } from './OrderEntryForm'

export function AddPurchaseOrder() {
  return (
    <OrderEntryForm
      pageTitle="Purchase Orders"
      formTitle="Add Purchase Entry"
      partyLabel="Select Dairy Factory/Factory"
      backTo="/purchase"
    />
  )
}
