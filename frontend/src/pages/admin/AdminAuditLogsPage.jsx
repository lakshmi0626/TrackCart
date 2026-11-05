import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldAlert, Search, Clock, FileText, Download } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('trackcart_token');
      const response = await fetch('/api/analytics/export/audit-logs/csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackcart-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit logs', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.analytics.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return l.action.toLowerCase().includes(term) ||
      l.entityName.toLowerCase().includes(term) ||
      (l.performedBy && l.performedBy.toLowerCase().includes(term)) ||
      (l.details && l.details.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Security & Compliance</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          System Audit Trail Logs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event ledger tracking mutations, status transitions, and user actions.
        </p>
      </div>

      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user email, details..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} entries
        </span>
      </div>

      <div className="card-subtle bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Performed By</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {log.entityName} #{log.entityId || ''}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {log.performedBy || 'system'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
