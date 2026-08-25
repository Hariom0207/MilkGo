import { OrderEntryForm } from './OrderEntryForm'

export function AddSalesOrder() {
  return (
    <OrderEntryForm
      pageTitle="Sales Orders"
      formTitle="Add Sales Entry"
      partyLabel="Select Dairy Factory/Factory"
      backTo="/sales"
    />
  )
}
