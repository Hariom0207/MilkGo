import { OrderEntryForm } from './OrderEntryForm'
import { customers } from '../data/customers'

export function AddSalesOrder() {
  return (
    <OrderEntryForm
      pageTitle="Sales Orders"
      formTitle="Add Sales Entry"
      partyLabel="Select Customer"
      backTo="/sales"
      endpoint="/sales-orders"
      parties={customers.map((c) => c.name)}
      partyKey="customerName"
    />
  )
}
