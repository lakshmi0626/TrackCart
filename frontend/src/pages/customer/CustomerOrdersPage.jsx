import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShoppingBag, 
  Search, 
  FileText, 
  Navigation, 
  XCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm("Are you sure you want to cancel this order? An immediate refund will be initiated.")) {
      setCancellingId(orderId);
      try {
        await api.orders.cancel(orderId, "Customer requested cancellation from portal");
        alert("Order successfully cancelled and refund initiated.");
        loadOrders();
      } catch (err) {
        alert("Cancellation failed: " + err.message);
      } finally {
        setCancellingId(null);
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = !search || 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Purchase History</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            My Orders & Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View order status, download official tax invoices, or track package milestones.
          </p>
        </div>

        <Link
          to="/customer/create-order"
          className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 self-start"
        >
          Create Order
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-subtle p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
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
            placeholder="Search order or tracking ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card-subtle p-12 bg-white text-center text-xs text-slate-400">
            No orders found matching the selected criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const canCancel = order.status === 'CONFIRMED' || order.status === 'PENDING';

            return (
              <div key={order.id} className="card-subtle bg-white overflow-hidden transition-all">
                {/* Order Summary Bar */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • Destination: <span className="font-medium text-slate-700">{order.city}, {order.state}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="text-right mr-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Amount Paid</p>
                      <p className="text-sm font-bold text-slate-900">${order.finalAmount}</p>
                    </div>

                    <a
                      href={api.orders.getInvoiceUrl(order.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                      title="Download printable tax invoice"
                    >
                      <FileText className="w-3.5 h-3.5" /> Invoice
                    </a>

                    <Link
                      to={`/track?id=${order.trackingNumber || order.orderNumber}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Live Track
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/60 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Package Contents</p>
                    <div className="divide-y divide-slate-200/60 border border-slate-200/80 rounded-xl bg-white overflow-hidden">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku} • Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-slate-900">${item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
