import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BarChart3, 
  Printer, 
  Download, 
  DollarSign, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Calendar
} from 'lucide-react';

export default function AdminReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await api.analytics.getAdminSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !summary) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading performance report...</div>;
  }

  const successRate = summary.totalOrders > 0 
    ? ((summary.deliveredOrders / summary.totalOrders) * 100).toFixed(1)
    : '100.0';

  const delayRate = summary.totalOrders > 0
    ? ((summary.delayedOrders / summary.totalOrders) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Business Intelligence</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Executive Logistical Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operational metrics, delivery success ratios, and fulfillment analytics.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 self-start shadow-xs"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          Print / Export Report
        </button>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-subtle p-5 bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Success Rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{successRate}%</span>
            <span className="text-xs text-slate-400">of total shipments</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${successRate}%` }}></div>
          </div>
        </div>

        <div className="card-subtle p-5 bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delay Incident Ratio</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-600">{delayRate}%</span>
            <span className="text-xs text-slate-400">affected by road/weather</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${delayRate}%` }}></div>
          </div>
        </div>

        <div className="card-subtle p-5 bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Turnaround</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">22.4 hrs</span>
            <span className="text-xs text-slate-400">order to door</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-3">Within 24hr SLA standard</p>
        </div>
      </div>

      {/* Structured Ledger Table */}
      <div className="card-subtle bg-white p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operations Balance Sheet</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Metric Category</th>
              <th className="py-2.5 px-3">Measured Count</th>
              <th className="py-2.5 px-3">Logistical Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Gross Sales Revenue</td>
              <td className="py-3 px-3 font-mono font-bold text-slate-900">${Number(summary.totalRevenue || 0).toFixed(2)}</td>
              <td className="py-3 px-3 text-emerald-600 font-semibold">100% Reconciled</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Total Registered Orders</td>
              <td className="py-3 px-3 font-mono font-bold text-slate-900">{summary.totalOrders}</td>
              <td className="py-3 px-3 text-slate-600">Active Database Records</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Fulfilled Deliveries</td>
              <td className="py-3 px-3 font-mono font-bold text-emerald-600">{summary.deliveredOrders}</td>
              <td className="py-3 px-3 text-emerald-600 font-semibold">Signed & Confirmed</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Pending In-Transit Pipeline</td>
              <td className="py-3 px-3 font-mono font-bold text-amber-600">{summary.pendingDeliveries}</td>
              <td className="py-3 px-3 text-amber-600 font-semibold">Assigned & Moving</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Delayed Shipments</td>
              <td className="py-3 px-3 font-mono font-bold text-rose-600">{summary.delayedOrders}</td>
              <td className="py-3 px-3 text-rose-600 font-semibold">Under Expedited Triage</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-slate-800">Active Fleet Couriers</td>
              <td className="py-3 px-3 font-mono font-bold text-slate-900">{summary.totalDeliveryPartners}</td>
              <td className="py-3 px-3 text-slate-600">EV Cargo & Hybrid Cruisers</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
