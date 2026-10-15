import { OrderList } from './OrderList'

const kpis = [
  { label: "Today's Sales", value: '₹1,84,350', badge: '+12.4%', tone: 'up' as const },
  { label: 'Remaining', value: '₹2,45,820', badge: '+8.2%', tone: 'up' as const },
  { label: 'Missing', value: '142', badge: '+3 New', tone: 'up' as const },
  { label: 'Pending Orders', value: '28', badge: '-5%', tone: 'down' as const },
]

export function SalesOrders() {
  return (
    <OrderList
      title="Sales Orders"
      listTitle="Monthly Sales List"
      partyHeader="Customer Name"
      partyKey="customerName"
      endpoint="/sales-orders"
      addTo="/sales/new"
      kpis={kpis}
    />
  )
}
