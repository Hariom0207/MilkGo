import { OrderEntryForm } from './OrderEntryForm'

export function AddPurchaseOrder() {
  return (
    <OrderEntryForm
      pageTitle="Purchase Orders"
      formTitle="Add Purchase Entry"
      partyLabel="Select Supplier"
      backTo="/purchase"
      endpoint="/purchases"
      partiesEndpoint="/suppliers"
      parties={[]}
      partyKey="supplierName"
    />
  )
}
