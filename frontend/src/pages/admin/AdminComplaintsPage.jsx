import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Edit3,
  X,
  Search
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Investigation Modal
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [status, setStatus] = useState('INVESTIGATING');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await api.complaints.getAll();
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (c) => {
    setEditingComplaint(c);
    setStatus(c.status || 'INVESTIGATING');
    setNotes(c.resolutionNotes || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setSaving(true);

    try {
      await api.complaints.updateStatus(editingComplaint.id, {
        status,
        resolutionNotes: notes,
      });
      alert("Ticket updated and notification dispatched to customer.");
      setEditingComplaint(null);
      loadComplaints();
    } catch (err) {
      alert("Failed to update ticket: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return c.ticketNumber.toLowerCase().includes(term) ||
      c.subject.toLowerCase().includes(term) ||
      (c.customerName && c.customerName.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Customer Experience</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Support & Dispute Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Investigate delivery complaints, update resolution status, and notify customers.
          </p>
        </div>
      </div>

      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, customer, subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total Tickets: {complaints.length}
        </span>
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="card-subtle p-5 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs text-slate-900">{c.ticketNumber}</span>
                <span className="text-xs font-semibold text-slate-700">• {c.customerName}</span>
                {c.orderNumber && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Order: {c.orderNumber}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.priority === 'URGENT' || c.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {c.priority} Priority
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  c.status === 'RESOLVED' || c.status === 'CLOSED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : c.status === 'INVESTIGATING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {c.status}
                </span>

                <button
                  onClick={() => openModal(c)}
                  className="px-3 py-1 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Resolve
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900">{c.subject}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
            </div>

            {c.resolutionNotes && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Admin Resolution Log:</p>
                <p>{c.resolutionNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Investigation Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Resolve Customer Dispute</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingComplaint.ticketNumber}</p>
              </div>
              <button onClick={() => setEditingComplaint(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="OPEN">OPEN (Under initial triage)</option>
                  <option value="INVESTIGATING">INVESTIGATING (In contact with carrier)</option>
                  <option value="RESOLVED">RESOLVED (Customer remedy provided)</option>
                  <option value="CLOSED">CLOSED (Matter finalized)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution & Customer Communication Notes</label>
                <textarea
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain remediation steps (e.g. secondary carrier assigned, coupon issued, refund verified)..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  {saving ? 'Saving...' : 'Update & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
