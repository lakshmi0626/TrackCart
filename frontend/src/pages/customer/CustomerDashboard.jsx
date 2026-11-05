import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  Clock, 
  FileText,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackInput, setTrackInput] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(false);
      const data = await api.orders.getAll();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeShipments = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + (Number(o.finalAmount) || 0), 0);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackInput.trim())}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="card-subtle p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Customer Portal</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Hello, {user?.fullName || 'Valued Customer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time package dispatches, order deliveries, and billing invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customer/create-order"
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Place New Order
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{orders.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Account lifetime</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-3">{activeShipments.length}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">In fulfillment & transit</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-3">{completedOrders.length}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Successfully received</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">${totalSpent.toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Taxes & shipping included</span>
        </div>
      </div>

      {/* Quick Tracking Search Bar */}
      <div className="card-subtle p-6 bg-white">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instant Tracking Hub</h2>
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              placeholder="Enter Tracking ID (e.g. TRK-TC-DEMO01) or Order ID (TC-ORD-2026-8812)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Track Shipment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Active Deliveries Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Active Deliveries</h2>
          <Link to="/customer/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeShipments.length === 0 ? (
          <div className="card-subtle p-8 bg-white text-center text-xs text-slate-400">
            No active shipments currently in transit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeShipments.map((order) => (
              <div key={order.id} className="card-subtle p-5 bg-white space-y-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tracking: <span className="font-mono font-semibold text-slate-700">{order.trackingNumber || 'Processing'}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                    {order.shipmentStatus?.replace(/_/g, ' ') || order.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{order.shippingAddress}, {order.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>ETA: {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'Pending'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">${order.finalAmount}</span>
                  <Link
                    to={`/track?id=${order.trackingNumber || order.orderNumber}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                  >
                    View Timeline <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Orders</h2>
        <div className="card-subtle bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {(order.items || []).map((i) => i.productName).join(', ') || 'Custom Package'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ${order.finalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={api.orders.getInvoiceUrl(order.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                        title="Download printable tax invoice"
                      >
                        <FileText className="w-3 h-3" /> Invoice
                      </a>
                      <Link
                        to={`/track?id=${order.trackingNumber || order.orderNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
