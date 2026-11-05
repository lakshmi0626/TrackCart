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

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('trackcart_token');
      const response = await fetch('/api/analytics/export/orders/csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackcart-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Orders CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Print / Export Report
          </button>
        </div>
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
            <span className="text-xs text-slate-400">breached SLA windows</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${delayRate}%` }}></div>
          </div>
        </div>

        <div className="card-subtle p-5 bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Fleet Fulfillment</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{summary.deliveredOrders}</span>
            <span className="text-xs text-slate-400">packages successfully delivered</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Across {summary.totalDeliveryPartners} active logistics partners.
          </p>
        </div>
      </div>

      {/* Financial & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-subtle p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Lifecycle Distribution
          </h2>
          <div className="space-y-3">
            {summary.orderStatusDistribution && Object.entries(summary.orderStatusDistribution).map(([st, cnt]) => (
              <div key={st} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-600">{st.replace('_', ' ')}</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{cnt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-subtle p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Revenue & Partner Analytics
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Gross Platform Merchandise Value</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">${Number(summary.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Customer Accounts</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
