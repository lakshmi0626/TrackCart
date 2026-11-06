import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick assign modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sumData, partData] = await Promise.all([
        api.analytics.getAdminSummary(),
        api.deliveryPartners.getAll(),
      ]);
      setSummary(sumData);
      setPartners(partData || []);
    } catch (err) {
      console.error("Failed to load admin summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPartnerId) return;
    setAssigning(true);
    try {
      // Find shipment for this order
      const shipment = await api.shipments.getByOrderId(selectedOrder.id);
      await api.shipments.assignPartner(shipment.id, Number(selectedPartnerId));
      alert(`Assigned partner to order ${selectedOrder.orderNumber}`);
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      alert("Assignment failed: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading operational analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Command Header */}
      <div className="card-subtle p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Enterprise Operations</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Admin Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>Live telemetry active • 
            Real-time logistical velocity, delivery performance, and fleet dispatch orchestration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Executive Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalOrders}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">All registered orders</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${Number(summary.totalRevenue || 0).toFixed(2)}</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Active sales revenue</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Transit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{summary.pendingDeliveries}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">In fulfillment & transit</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{summary.deliveredOrders}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Successfully fulfilled</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delayed Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{summary.delayedOrders}</p>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">Overdue deadline alerts</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fleet Partners</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalDeliveryPartners}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered couriers</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalCustomers}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Consumer accounts</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.openComplaints}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending support review</span>
        </div>
      </div>

      {/* Status Distribution Breakdown */}
      <div className="card-subtle p-6 bg-white space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Distribution Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Object.entries(summary.statusDistribution || {}).map(([key, count]) => (
            <div key={key} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{key.replace(/_/g, ' ')}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders with Quick Assign Action */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Orders Dispatch Queue</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View full queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card-subtle bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Partner</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(summary.recentOrders || []).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{order.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {order.city}, {order.state}
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
                    <td className="py-3 px-4 text-slate-700">
                      {order.assignedPartnerName ? (
                        <span className="font-medium flex items-center gap-1.5 text-slate-800">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          {order.assignedPartnerName}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold"
                        >
                          + Assign Driver
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${order.finalAmount}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={api.orders.getInvoiceUrl(order.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded"
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

      {/* Assign Driver Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assign Delivery Partner</h3>
                <p className="text-xs text-slate-500">Order: <span className="font-mono font-bold text-slate-800">{selectedOrder.orderNumber}</span></p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Logistics Fleet Driver</label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Choose verified partner --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} • {p.vehicleType} ({p.vehicleNumber}) • Rating {p.rating}★
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigning || !selectedPartnerId}
                onClick={handleAssign}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                {assigning ? 'Dispatching...' : 'Assign & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
