import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  HelpCircle, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ShieldAlert,
  X
} from 'lucide-react';

export default function CustomerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [complaintsData, ordersData] = await Promise.all([
        api.complaints.getAll(),
        api.orders.getAll(),
      ]);
      setComplaints(complaintsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.complaints.create({
        orderId: orderId ? Number(orderId) : null,
        subject,
        description,
        priority,
      });
      setShowModal(false);
      setSubject('');
      setDescription('');
      setOrderId('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Help & Resolution</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Customer Support Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log order disputes, report delivery delays, or request customer assistance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 self-start shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          Log Support Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="card-subtle p-12 bg-white text-center text-xs text-slate-400">
            No support tickets logged. If you have questions regarding an order, click above to log a ticket.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="card-subtle p-5 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-slate-900">{c.ticketNumber}</span>
                  {c.orderNumber && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Ref: {c.orderNumber}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.priority === 'URGENT' || c.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.priority} Priority
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border self-start ${
                  c.status === 'RESOLVED' || c.status === 'CLOSED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : c.status === 'INVESTIGATING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {c.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">{c.subject}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
              </div>

              {c.resolutionNotes && (
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                  <p className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-0.5">Admin Resolution Notes:</p>
                  <p>{c.resolutionNotes}</p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-mono pt-1">
                Submitted on {new Date(c.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Log Customer Complaint Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related Order (Optional)</label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="">General inquiry (No specific order)</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} – ${o.finalAmount} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Shipment delayed past scheduled ETA"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Immediate attention)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue with details..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
