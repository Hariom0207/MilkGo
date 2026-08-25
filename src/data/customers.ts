export type Customer = {
  id: string
  name: string
  initials: string
  customerId: string
  phone: string
  area: string
  address: string
  frequency: string
  distributor: string
  joinDate: string
}

export const customers: Customer[] = [
  {
    id: 'ganga-dairy',
    name: 'Ganga Dairy Co.',
    initials: 'GD',
    customerId: 'DF-CUST-84920',
    phone: '+91 98765 43210',
    area: 'Sector 4, HSR Layout',
    address: 'House #412, 12th Cross Road, HSR Layout, Bengaluru, Karnataka 560102',
    frequency: 'Daily (Morning Delivery)',
    distributor: 'Anand Kumar (HSR Route 3)',
    joinDate: '14 Oct 2023',
  },
  {
    id: 'yamuna-dairy',
    name: 'Yamuna Dairy Pvt Ltd',
    initials: 'YD',
    customerId: 'DF-CUST-84921',
    phone: '+91 98111 22001',
    area: 'Okhla Phase 2',
    address: 'Plot 18, Okhla Industrial Area, New Delhi 110020',
    frequency: 'Daily (Evening Delivery)',
    distributor: 'Ravi Singh (South Route 1)',
    joinDate: '02 Jan 2024',
  },
  {
    id: 'saraswati-ghee',
    name: 'Saraswati Ghee Works',
    initials: 'SG',
    customerId: 'DF-CUST-84922',
    phone: '+91 99220 11880',
    area: 'Whitefield',
    address: '22, EPIP Zone, Whitefield, Bengaluru 560066',
    frequency: 'Weekly (Tuesday)',
    distributor: 'Meena Joshi (East Route 4)',
    joinDate: '18 Mar 2023',
  },
  {
    id: 'butter-cream',
    name: 'Butter & Cream Co.',
    initials: 'BC',
    customerId: 'DF-CUST-84923',
    phone: '+91 97654 00912',
    area: 'Andheri West',
    address: 'Shop 7, Link Road, Andheri West, Mumbai 400053',
    frequency: 'Daily (Morning Delivery)',
    distributor: 'Suresh Nair (West Route 2)',
    joinDate: '09 Jul 2022',
  },
  {
    id: 'dairy-hub',
    name: 'Dairy Hub Pvt Ltd',
    initials: 'DH',
    customerId: 'DF-CUST-84924',
    phone: '+91 90012 44567',
    area: 'Salt Lake',
    address: 'Block AQ, Sector V, Salt Lake, Kolkata 700091',
    frequency: 'Alternate days',
    distributor: 'Priya Das (City Route 6)',
    joinDate: '27 Nov 2023',
  },
]

export function getCustomer(id: string | undefined) {
  return customers.find((customer) => customer.id === id)
}
