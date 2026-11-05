import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';

export default function PartnerDeliveriesPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [targetStatus, setTargetStatus] = useState('PICKED_UP');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await api.deliveryPartners.getMyAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (shipment, status) => {
    setSelectedShipment(shipment);
    setTargetStatus(status);
    setDeliveryNotes('');
    setDelayReason('');
  };

  const handleApplyStatus = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setUpdating(true);

    try {
      const isDelay = targetStatus === 'DELAYED';
      await api.shipments.updateStatus(selectedShipment.id, {
        status: targetStatus,
        location: selectedShipment.destinationCity || 'Transit Route',
        description: deliveryNotes || `Status updated to ${targetStatus}`,
        isDelayed: isDelay,
        delayReason: isDelay ? delayReason : null,
      });
      alert(`Milestone successfully updated to ${targetStatus}`);
      setSelectedShipment(null);
      loadAssignments();
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const active = assignments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'FAILED');

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Driver Route</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Active Delivery Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute status transitions from depot pickup to front-door drop-off.
        </p>
      </div>

      <div className="space-y-4">
        {active.length === 0 ? (
          <div className="card-subtle p-12 bg-white text-center text-xs text-slate-400">
            No pending deliveries in your queue.
          </div>
        ) : (
          active.map((s) => (
            <div key={s.id} className="card-subtle p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900">{s.trackingNumber}</span>
                  <p className="text-xs text-slate-500">Order: <span className="font-mono font-bold text-slate-700">{s.orderNumber}</span></p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border self-start ${
                  s.isDelayed ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {s.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Delivery Drop Address</p>
                  <p className="font-semibold text-slate-800">{s.destinationAddress}</p>
                  <p className="text-slate-500">City: {s.destinationCity}</p>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Delivery Window</p>
                  <p className="font-semibold text-slate-800">
                    {s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
                  </p>
                  {s.isDelayed && (
                    <p className="text-rose-600 font-medium">Delay Reason: {s.delayReason}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {s.status === 'PACKED' || s.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => openStatusModal(s, 'PICKED_UP')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" /> Mark Picked Up
                  </button>
                ) : s.status === 'PICKED_UP' || s.status === 'SHIPPED' || s.status === 'IN_TRANSIT' ? (
                  <button
                    onClick={() => openStatusModal(s, 'OUT_FOR_DELIVERY')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" /> Out For Delivery
                  </button>
                ) : s.status === 'OUT_FOR_DELIVERY' ? (
                  <button
                    onClick={() => openStatusModal(s, 'DELIVERED')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Drop-off
                  </button>
                ) : null}

                <button
                  onClick={() => openStatusModal(s, 'DELAYED')}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Report Delay
                </button>

                <Link
                  to={`/track?id=${s.trackingNumber}`}
                  className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Full Milestone Timeline &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Confirm Milestone: <span className="text-emerald-600">{targetStatus.replace(/_/g, ' ')}</span>
              </h3>
              <button onClick={() => setSelectedShipment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyStatus} className="space-y-4">
              {targetStatus === 'DELAYED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delay Incident Reason</label>
                  <input
                    type="text"
                    required
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="e.g. Extreme traffic / Road construction"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Check-in Notes</label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Notes regarding parcel handling or drop-off..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  {updating ? 'Updating...' : `Confirm ${targetStatus.replace(/_/g, ' ')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
