import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  Search
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group unique customers from orders
  const customerMap = new Map();
  orders.forEach((o) => {
    const email = o.customerEmail || 'unknown@example.com';
    if (!customerMap.has(email)) {
      customerMap.set(email, {
        name: o.customerName || 'Anonymous Customer',
        email: email,
        phone: o.customerPhone || '+1-555-0100',
        city: o.city || 'Metro',
        state: o.state || 'CA',
        address: o.shippingAddress || 'Customer Address',
        orderCount: 1,
        totalSpent: Number(o.finalAmount || 0),
      });
    } else {
      const existing = customerMap.get(email);
      existing.orderCount += 1;
      existing.totalSpent += Number(o.finalAmount || 0);
    }
  });

  const customers = Array.from(customerMap.values()).filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.city.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">User Directory</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Customer Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer profiles, delivery addresses, and cumulative order volume.
          </p>
        </div>
      </div>

      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, email, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Active Accounts: {customers.length}
        </span>
      </div>

      <div className="card-subtle bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Shipping Destination</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4 text-right">Lifetime Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {c.email}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.city}, {c.state}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {c.orderCount}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ${c.totalSpent.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
