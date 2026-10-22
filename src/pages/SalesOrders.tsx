import { OrderList } from './OrderList'

export function SalesOrders() {
  return (
    <OrderList
      title="Sales Orders"
      listTitle="Sales List"
      partyHeader="Customer Name"
      partyKey="customerName"
      endpoint="/sales-orders"
      addTo="/sales/new"
    />
  )
}
