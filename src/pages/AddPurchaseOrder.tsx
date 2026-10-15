import { OrderEntryForm } from './OrderEntryForm'

export function AddPurchaseOrder() {
  return (
    <OrderEntryForm
      pageTitle="Purchase Orders"
      formTitle="Add Purchase Entry"
      partyLabel="Select Dairy Factory/Factory"
      backTo="/purchase"
      endpoint="/purchases"
      parties={['Apex Dairy Farms Ltd.', 'Ganga Dairy Co.', 'Yamuna Dairy Pvt Ltd']}
      partyKey="supplierName"
    />
  )
}
