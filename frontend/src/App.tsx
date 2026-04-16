import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

// Pages
import WelcomePage from './pages/Welcome'
import LoginPage from './pages/Auth/Login'
import SignupPage from './pages/Auth/Signup'
import CallbackPage from './pages/Auth/Callback'
import DashboardPage from './pages/Dashboard'
import ProductsPage from './pages/Products'
import ProductDetailPage from './pages/Products/Detail'
import OrdersPage from './pages/Orders'
import OrderDetailPage from './pages/Orders/Detail'
import AnalyticsPage from './pages/Analytics'
import SettingsPage from './pages/Settings'

// Layout
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/auth/success" element={<CallbackPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
