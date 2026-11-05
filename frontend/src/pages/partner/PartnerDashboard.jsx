import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Star, 
  Clock, 
  MapPin, 
  Navigation, 
  ArrowRight,
  AlertTriangle,
  Send,
  Power,
  X
} from 'lucide-react';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Modal
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [targetStatus, setTargetStatus] = useState('PICKED_UP');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profData, analData, assignData] = await Promise.all([
        api.deliveryPartners.getProfile(),
        api.analytics.getPartnerSummary(),
        api.deliveryPartners.getMyAssignments(),
      ]);
      setProfile(profData);
      setAnalytics(analData);
      setAssignments(assignData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const updated = await api.deliveryPartners.updateAvailability(!profile.isAvailable);
      setProfile(updated);
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
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
        description: deliveryNotes || `Package status updated to ${targetStatus}`,
        isDelayed: isDelay,
        delayReason: isDelay ? delayReason : null,
      });
      alert(`Shipment milestone updated to ${targetStatus}`);
      setSelectedShipment(null);
      loadData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const activeAssignments = assignments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'FAILED');

  return (
    <div className="space-y-8">
      {/* Driver Header */}
      <div className="card-subtle p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
            {profile?.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Driver Terminal</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {profile?.fullName || 'Courier Partner'}
            </h1>
            <p className="text-xs text-slate-500">
              Vehicle: <span className="font-semibold text-slate-800">{profile?.vehicleType}</span> ({profile?.vehicleNumber}) • License: {profile?.licenseNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              profile?.isAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {profile?.isAvailable ? 'Status: ONLINE & AVAILABLE' : 'Status: OFFLINE'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{analytics?.activeDeliveries || 0}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">In your delivery queue</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{profile?.completedDeliveries || 0}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Verified customer drop-offs</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Driver Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{profile?.rating?.toFixed(1) || '5.0'} ★</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Customer satisfaction</span>
        </div>

        <div className="card-subtle p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Payout</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${Number(analytics?.estimatedEarnings || 0).toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">$15.50 / completed drop</span>
        </div>
      </div>

      {/* Active Assignments Queue with One-Click Transitions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Assigned Delivery Queue ({activeAssignments.length})
          </h2>
          <Link to="/partner/history" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Delivery History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="card-subtle p-12 bg-white text-center text-xs text-slate-400">
            No active deliveries assigned at this moment. You will be notified when new dispatches arrive.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAssignments.map((shipment) => (
              <div key={shipment.id} className="card-subtle p-5 bg-white space-y-4 border hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">{shipment.trackingNumber}</span>
                    <p className="text-xs text-slate-500 mt-0.5">Order Ref: <span className="font-mono font-semibold text-slate-700">{shipment.orderNumber}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    shipment.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : shipment.isDelayed
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {shipment.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{shipment.destinationAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>ETA: {shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ASAP'}</span>
                  </div>
                </div>

                {/* Transition Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {shipment.status === 'PACKED' || shipment.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => openStatusModal(shipment, 'PICKED_UP')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" /> Mark Picked Up
                    </button>
                  ) : shipment.status === 'PICKED_UP' || shipment.status === 'SHIPPED' || shipment.status === 'IN_TRANSIT' ? (
                    <button
                      onClick={() => openStatusModal(shipment, 'OUT_FOR_DELIVERY')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" /> Out For Delivery
                    </button>
                  ) : shipment.status === 'OUT_FOR_DELIVERY' ? (
                    <button
                      onClick={() => openStatusModal(shipment, 'DELIVERED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Drop-off
                    </button>
                  ) : null}

                  <button
                    onClick={() => openStatusModal(shipment, 'DELAYED')}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Report Delay
                  </button>

                  <Link
                    to={`/track?id=${shipment.trackingNumber}`}
                    className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Timeline &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Driver Milestone Transition Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Update Delivery: <span className="text-emerald-600">{targetStatus.replace(/_/g, ' ')}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedShipment.trackingNumber}</p>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyStatus} className="space-y-4">
              {targetStatus === 'DELAYED' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delay Incident Reason</label>
                  <input
                    type="text"
                    required
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="e.g. Heavy traffic bottleneck on bridge / Severe rain"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {targetStatus === 'DELIVERED' ? 'Delivery Notes / Recipient Signature Confirmation' : 'Driver Check-in Notes'}
                </label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={targetStatus === 'DELIVERED' ? "Left with resident John D. at front door. Verified ID." : "Package scanned and vehicle departed depot."}
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
