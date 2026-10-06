import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AddPurchaseOrder } from './pages/AddPurchaseOrder'
import { AddSalesOrder } from './pages/AddSalesOrder'
import { CustomerDetails } from './pages/CustomerDetails'
import { CustomerOrders } from './pages/CustomerOrders'
import { DashboardOverview } from './pages/DashboardOverview'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProductsCatalog } from './pages/ProductsCatalog'
import { PurchaseOrders } from './pages/PurchaseOrders'
import { SalesOrders } from './pages/SalesOrders'
import { SignUpPage } from './pages/SignUpPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes: Root / starts on Login, with direct routes for /login and /signup */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected / App routes */}
        <Route element={<AppLayout />}>
          <Route path="home" element={<DashboardOverview />} />
          <Route path="dashboard" element={<Navigate to="/home" replace />} />
          <Route path="purchase" element={<PurchaseOrders />} />
          <Route path="purchase/new" element={<AddPurchaseOrder />} />
          <Route path="sales" element={<SalesOrders />} />
          <Route path="sales/new" element={<AddSalesOrder />} />
          <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
          <Route path="distributors" element={<PlaceholderPage title="Distributors" />} />
          <Route path="customers" element={<CustomerOrders />} />
          <Route path="customers/:customerId" element={<CustomerDetails />} />
          <Route path="products" element={<ProductsCatalog />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
