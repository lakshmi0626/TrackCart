import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, DollarSign, Calendar, MapPin, Search } from 'lucide-react';

export default function PartnerHistoryPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.deliveryPartners.getMyAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completed = assignments.filter((s) => s.status === 'DELIVERED');

  const filtered = completed.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.trackingNumber.toLowerCase().includes(term) ||
      (s.orderNumber && s.orderNumber.toLowerCase().includes(term)) ||
      (s.destinationCity && s.destinationCity.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Historical Records</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Completed Delivery History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of fulfilled package drop-offs, timestamps, and accrued courier earnings.
          </p>
        </div>

        <div className="card-subtle px-4 py-2 bg-white flex items-center gap-3">
          <span className="text-xs text-slate-400">Total Fulfilled Payout:</span>
          <span className="font-mono font-bold text-emerald-600 text-sm">
            ${(completed.length * 15.5).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking #, order #, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Completed Drops: {filtered.length}
        </span>
      </div>

      <div className="card-subtle bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Tracking Number</th>
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Destination</th>
                <th className="py-2.5 px-4">Delivered At</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Earned Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No completed deliveries logged yet.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.trackingNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.destinationCity || s.destinationAddress}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {s.deliveredTime ? new Date(s.deliveredTime).toLocaleString() : 'Confirmed'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> FULFILLED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      $15.50
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
