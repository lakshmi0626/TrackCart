import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Navigation, 
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Edit3,
  X,
  Search
} from 'lucide-react';

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Update modal
  const [editingShipment, setEditingShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('PACKED');
  const [newLocation, setNewLocation] = useState('Central Hub');
  const [newDescription, setNewDescription] = useState('');
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadShipments();
  }, [delayedOnly]);

  const loadShipments = async () => {
    try {
      const data = await api.shipments.getAll(delayedOnly ? { delayed: true } : {});
      setShipments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (s) => {
    setEditingShipment(s);
    setNewStatus(s.status || 'PACKED');
    setNewLocation(s.destinationCity || 'Metro Hub');
    setNewDescription('');
    setIsDelayed(Boolean(s.isDelayed));
    setDelayReason(s.delayReason || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingShipment) return;
    setUpdating(true);

    try {
      await api.shipments.updateStatus(editingShipment.id, {
        status: newStatus,
        location: newLocation,
        description: newDescription || `Status milestone updated to ${newStatus}`,
        isDelayed,
        delayReason: isDelayed ? delayReason : null,
      });
      alert("Shipment status updated successfully!");
      setEditingShipment(null);
      loadShipments();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.trackingNumber.toLowerCase().includes(term) ||
      (s.orderNumber && s.orderNumber.toLowerCase().includes(term)) ||
      (s.partnerName && s.partnerName.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Logistics Fleet</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Shipment Milestone Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time package stages, detect delivery delays, and update milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDelayedOnly(!delayedOnly)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              delayedOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {delayedOnly ? 'Showing Delayed Only' : 'Filter Delayed Shipments'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking #, order ref, driver..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} shipments
        </span>
      </div>

      {/* Shipments Table */}
      <div className="card-subtle bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Status Stage</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.trackingNumber}
                      {s.isDelayed && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                          DELAYED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.carrierName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.isDelayed
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {s.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {s.partnerName ? (
                        <div>
                          <p className="font-semibold text-slate-800">{s.partnerName}</p>
                          <p className="text-[10px] text-slate-400">{s.partnerVehicle}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openUpdateModal(s)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                      >
                        <Edit3 className="w-3 h-3" /> Update
                      </button>
                      <Link
                        to={`/track?id=${s.trackingNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                      >
                        Timeline
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Status Override Modal */}
      {editingShipment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Shipment Milestone</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingShipment.trackingNumber}</p>
              </div>
              <button onClick={() => setEditingShipment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="PACKED">PACKED (Packaging finalized)</option>
                  <option value="PICKED_UP">PICKED UP (Driver collected package)</option>
                  <option value="SHIPPED">SHIPPED (In line-haul transit)</option>
                  <option value="IN_TRANSIT">IN TRANSIT (Mid-route junction hub)</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (Last mile)</option>
                  <option value="DELIVERED">DELIVERED (Customer confirmed)</option>
                  <option value="DELAYED">DELAYED (Operational bottleneck)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Milestone Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. San Francisco Sorting Facility"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Description / Courier Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Package arrived at local distribution center"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDelayed}
                    onChange={(e) => setIsDelayed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-rose-700">Flag as Delayed Shipment</span>
                </label>

                {isDelayed && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delay Reason</label>
                    <input
                      type="text"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      placeholder="e.g. Road closure on interstate transit corridor"
                      className="w-full px-3 py-1.5 text-xs border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  {updating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
