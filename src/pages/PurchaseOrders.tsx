import { OrderList } from './OrderList'

const kpis = [
  { label: "Today's Purchase", value: '₹1,84,350', badge: '+12.4%', tone: 'up' as const },
  { label: 'Monthly Purchase', value: '₹2,45,820', badge: '+8.2%', tone: 'up' as const },
  { label: 'Active Distributors', value: '142', badge: '+3 New', tone: 'up' as const },
  { label: 'Pending Orders', value: '28', badge: '-5%', tone: 'down' as const },
]

export function PurchaseOrders() {
  return (
    <OrderList
      title="Purchase Orders"
      listTitle="Monthly Purchase List"
      partyHeader="Supplier Name"
      partyKey="supplierName"
      endpoint="/purchases"
      addTo="/purchase/new"
      kpis={kpis}
    />
  )
}
