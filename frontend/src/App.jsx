import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateOrderPage from './pages/customer/CreateOrderPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerComplaintsPage from './pages/customer/CustomerComplaintsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminShipmentsPage from './pages/admin/AdminShipmentsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminPartnersPage from './pages/admin/AdminPartnersPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

// Partner Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerDeliveriesPage from './pages/partner/PartnerDeliveriesPage';
import PartnerHistoryPage from './pages/partner/PartnerHistoryPage';

// Common
import TrackingPage from './pages/tracking/TrackingPage';
import ProfilePage from './pages/ProfilePage';

function RootRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Initializing TrackCart...</div>;
  if (!user) return <Navigate to="/track" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'DELIVERY_PARTNER') return <Navigate to="/partner" replace />;
  return <Navigate to="/customer" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Customer Routes */}
              <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/create-order" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CreateOrderPage /></ProtectedRoute>} />
              <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerOrdersPage /></ProtectedRoute>} />
              <Route path="/customer/complaints" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerComplaintsPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminOrdersPage /></ProtectedRoute>} />
              <Route path="/admin/shipments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminShipmentsPage /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCustomersPage /></ProtectedRoute>} />
              <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPartnersPage /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminComplaintsPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReportsPage /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogsPage /></ProtectedRoute>} />

              {/* Delivery Partner Routes */}
              <Route path="/partner" element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/partner/deliveries" element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}><PartnerDeliveriesPage /></ProtectedRoute>} />
              <Route path="/partner/history" element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}><PartnerHistoryPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
