import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AddProduct } from './pages/AddProduct'
import { AddPurchaseOrder } from './pages/AddPurchaseOrder'
import { AddSalesOrder } from './pages/AddSalesOrder'
import { CustomerDetails } from './pages/CustomerDetails'
import { CustomerOrders } from './pages/CustomerOrders'
import { DailyStatus } from './pages/DailyStatus'
import { DashboardOverview } from './pages/DashboardOverview'
import { Distributors } from './pages/Distributors'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProductsCatalog } from './pages/ProductsCatalog'
import { PurchaseOrders } from './pages/PurchaseOrders'
import { SalesOrders } from './pages/SalesOrders'
import { SignUpPage } from './pages/SignUpPage'
import { UserManagement } from './pages/UserManagement'
import { VendorDetail } from './pages/VendorDetail'
import { Vendors } from './pages/Vendors'
import { NotFoundPage } from './pages/NotFoundPage'
import { useAuth } from './context/AuthContext'
import { canAccess, type Role } from './lib/roles'

/** Blocks routes the role may not open (defense on top of hidden nav). */
function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { profile } = useAuth()
  const { pathname } = useLocation()
  if (!profile || !roles.includes(profile.role) || !canAccess(profile.role, pathname)) return <Navigate to="/home" replace />
  return <>{children}</>
}
const staffUp: Role[] = ['admin', 'vendor', 'staff']
const vendorUp: Role[] = ['admin', 'vendor']

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<AppLayout />}>
          <Route path="home" element={<DashboardOverview />} />
          <Route path="dashboard" element={<Navigate to="/home" replace />} />
          <Route path="admin/users" element={<Guard roles={['admin']}><UserManagement mode="admin" /></Guard>} />
          <Route path="admin/vendors" element={<Guard roles={['admin']}><Vendors /></Guard>} />
          <Route path="admin/vendors/:vendorId" element={<Guard roles={['admin']}><VendorDetail /></Guard>} />
          <Route path="team" element={<Guard roles={vendorUp}><UserManagement mode="team" /></Guard>} />
          <Route path="purchase" element={<Guard roles={staffUp}><PurchaseOrders /></Guard>} />
          <Route path="purchase/new" element={<Guard roles={staffUp}><AddPurchaseOrder /></Guard>} />
          <Route path="sales" element={<Guard roles={staffUp}><SalesOrders /></Guard>} />
          <Route path="sales/new" element={<Guard roles={staffUp}><AddSalesOrder /></Guard>} />
          <Route path="daily-status" element={<Guard roles={staffUp}><DailyStatus /></Guard>} />
          <Route path="inventory" element={<Guard roles={vendorUp}><PlaceholderPage title="Inventory" /></Guard>} />
          <Route path="distributors" element={<Guard roles={vendorUp}><Distributors /></Guard>} />
          <Route path="customers" element={<Guard roles={vendorUp}><CustomerOrders /></Guard>} />
          <Route path="customers/:customerId" element={<Guard roles={vendorUp}><CustomerDetails /></Guard>} />
          <Route path="products" element={<Guard roles={vendorUp}><ProductsCatalog /></Guard>} />
          <Route path="products/new" element={<Guard roles={vendorUp}><AddProduct /></Guard>} />
          <Route path="reports" element={<Guard roles={vendorUp}><PlaceholderPage title="Reports" /></Guard>} />
          <Route path="settings" element={<Guard roles={vendorUp}><PlaceholderPage title="Settings" /></Guard>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
