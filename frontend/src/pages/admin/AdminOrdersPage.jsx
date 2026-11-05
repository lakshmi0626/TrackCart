import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShoppingBag, 
  Search, 
  FileText, 
  Navigation, 
  Truck, 
  CheckCircle2, 
  X 
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Assign modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orderData, partnerData] = await Promise.all([
        api.orders.getAll(),
        api.deliveryPartners.getAll(),
      ]);
      setOrders(orderData || []);
      setPartners(partnerData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPartnerId) return;
    setAssigning(true);
    try {
      const shipment = await api.shipments.getByOrderId(selectedOrder.id);
      await api.shipments.assignPartner(shipment.id, Number(selectedPartnerId));
      alert(`Partner successfully assigned to order ${selectedOrder.orderNumber}`);
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      alert("Assignment failed: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = !search || 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Enterprise Dispatch</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Order Management & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor fulfillment stages, assign carrier delivery partners, and access invoices.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-subtle p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, customer, tracking..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
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
                ))
              )}
            </tbody>
          </table>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Fleet Driver</label>
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
