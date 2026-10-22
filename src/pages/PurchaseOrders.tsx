import { OrderList } from './OrderList'

export function PurchaseOrders() {
  return (
    <OrderList
      title="Purchase Orders"
      listTitle="Purchase List"
      partyHeader="Supplier Name"
      partyKey="supplierName"
      endpoint="/purchases"
      addTo="/purchase/new"
    />
  )
}
