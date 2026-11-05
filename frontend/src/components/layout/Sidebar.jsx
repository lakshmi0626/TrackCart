import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Navigation, 
  Users, 
  Truck, 
  HelpCircle, 
  BarChart3, 
  ShieldAlert, 
  PlusCircle, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useAuth();

  const getNavItems = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Overview Analytics', to: '/admin', icon: LayoutDashboard },
        { label: 'Order Dispatch', to: '/admin/orders', icon: ShoppingBag },
        { label: 'Shipment Tracking', to: '/admin/shipments', icon: Navigation },
        { label: 'Customers', to: '/admin/customers', icon: Users },
        { label: 'Delivery Partners', to: '/admin/partners', icon: Truck },
        { label: 'Support & Tickets', to: '/admin/complaints', icon: HelpCircle },
        { label: 'Executive Reports', to: '/admin/reports', icon: BarChart3 },
        { label: 'System Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
      ];
    } else if (role === 'DELIVERY_PARTNER') {
      return [
        { label: 'Partner Overview', to: '/partner', icon: LayoutDashboard },
        { label: 'Assigned Deliveries', to: '/partner/deliveries', icon: Truck },
        { label: 'Intelligent Tracking', to: '/track', icon: Navigation },
        { label: 'Delivery History', to: '/partner/history', icon: FileText },
        { label: 'Profile & Vehicle', to: '/profile', icon: UserCheck },
      ];
    } else {
      // CUSTOMER default
      return [
        { label: 'Customer Overview', to: '/customer', icon: LayoutDashboard },
        { label: 'Create New Order', to: '/customer/create-order', icon: PlusCircle },
        { label: 'My Orders & Invoices', to: '/customer/orders', icon: ShoppingBag },
        { label: 'Shipment Tracking', to: '/track', icon: Navigation },
        { label: 'Help & Complaints', to: '/customer/complaints', icon: HelpCircle },
        { label: 'Account Profile', to: '/profile', icon: UserCheck },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-57px)] flex flex-col justify-between py-6 px-3">
      <div className="space-y-1">
        <div className="px-3 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role === 'ADMIN' ? 'Command Center' : role === 'DELIVERY_PARTNER' ? 'Driver Terminal' : 'Consumer Portal'}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin' || item.to === '/customer' || item.to === '/partner'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status info */}
      <div className="px-3 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-700">Logistics Node</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">v1.0.0-PROD</p>
          <p className="text-[10px] text-slate-400 mt-1">PostgreSQL • JWT • Spring 3</p>
        </div>
      </div>
    </aside>
  );
}
