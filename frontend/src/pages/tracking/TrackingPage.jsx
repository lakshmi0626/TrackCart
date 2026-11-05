import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import { Search, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

export default function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id') || 'TRK-TC-DEMO01';

  const [inputVal, setInputVal] = useState(idFromUrl);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (idFromUrl) {
      setInputVal(idFromUrl);
      fetchTracking(idFromUrl);
    }
  }, [idFromUrl]);

  const fetchTracking = async (trackingId) => {
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.shipments.track(trackingId.trim());
      setShipment(data);
    } catch (err) {
      setError(err.message || 'Tracking ID not found');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ id: inputVal.trim() });
      fetchTracking(inputVal.trim());
    }
  };

  const setDemoId = (id) => {
    setInputVal(id);
    setSearchParams({ id });
    fetchTracking(id);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card-subtle p-6 bg-white space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Public & Private Radar</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Intelligent Shipment Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query real-time 6-stage telemetry, carrier dispatch logs, and delivery ETAs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Tracking Number (e.g. TRK-TC-DEMO01) or Order Ref..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            Track Parcel
          </button>
        </form>

        {/* Demo Preset Pills */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Demo Quick Presets:</span>
          <button
            onClick={() => setDemoId('TRK-TC-DEMO01')}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 font-mono text-[11px] text-slate-700"
          >
            DEMO01 (Delivered)
          </button>
          <button
            onClick={() => setDemoId('TRK-TC-DEMO02')}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 font-mono text-[11px] text-slate-700"
          >
            DEMO02 (Out for Delivery)
          </button>
          <button
            onClick={() => setDemoId('TRK-TC-DEMO03')}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 font-mono text-[11px] text-slate-700"
          >
            DEMO03 (In Transit)
          </button>
          <button
            onClick={() => setDemoId('TRK-TC-DEMO04')}
            className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 font-mono text-[11px] text-slate-700"
          >
            DEMO04 (Packed)
          </button>
          <button
            onClick={() => setDemoId('TRK-TC-DEMO05')}
            className="px-2.5 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 font-mono text-[11px] text-rose-700 font-semibold"
          >
            DEMO05 (Delayed Warning)
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="card-subtle p-6 bg-white text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Shipment Record Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        </div>
      )}

      {/* Timeline Display */}
      {shipment && (
        <TrackingTimeline
          shipment={shipment}
          onRefresh={() => fetchTracking(inputVal)}
        />
      )}
    </div>
  );
}
