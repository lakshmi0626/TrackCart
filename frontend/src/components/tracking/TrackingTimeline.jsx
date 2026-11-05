import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Truck, 
  Package, 
  AlertTriangle, 
  MapPin, 
  User, 
  Phone, 
  Copy, 
  Check, 
  Calendar,
  ShieldCheck,
  Send
} from 'lucide-react';

const STAGES = [
  { label: 'Order Placed', desc: 'Payment verified & order captured' },
  { label: 'Confirmed', desc: 'Inventory verified by dispatch hub' },
  { label: 'Packed', desc: 'Package labeled & staged for transit' },
  { label: 'Shipped', desc: 'In line-haul freight transit' },
  { label: 'Out for Delivery', desc: 'With courier for final drop-off' },
  { label: 'Delivered', desc: 'Handed to customer & confirmed' },
];

export default function TrackingTimeline({ shipment, onRefresh }) {
  const [copied, setCopied] = useState(false);

  if (!shipment) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStage = shipment.currentStage ?? 0;
  const isDelivered = shipment.status === 'DELIVERED';
  const isDelayed = Boolean(shipment.isDelayed);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card-subtle p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {shipment.trackingNumber}
              </h2>
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Copy tracking number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Carrier: <span className="font-semibold text-slate-700">{shipment.carrierName || 'TrackCart Express'}</span> • Order Ref: <span className="font-mono text-slate-700">{shipment.orderNumber}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Estimated Delivery</p>
              <p className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {shipment.estimatedDeliveryDate 
                  ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Pending assignment'}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isDelivered
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDelayed
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isDelivered ? <CheckCircle className="w-3.5 h-3.5" /> : isDelayed ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {shipment.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Delayed Alert Warning Banner */}
        {isDelayed && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Delayed Shipment Detected</p>
              <p className="text-xs mt-0.5 text-amber-700 leading-relaxed">
                {shipment.delayReason || 'Shipment has exceeded its scheduled transit timeline. Logistics dispatch has assigned expedited routing.'}
              </p>
            </div>
          </div>
        )}

        {/* 6-Stage Timeline Progress Bar */}
        <div className="mt-8 pt-2">
          <div className="relative">
            {/* Background connecting bar */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0 rounded-full" />
            {/* Active connecting bar */}
            <div 
              className="hidden sm:block absolute top-5 left-6 h-1 bg-emerald-600 -z-0 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, (currentStage / (STAGES.length - 1)) * 95))}%` }}
            />

            {/* Stages grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
              {STAGES.map((st, index) => {
                const isPassed = index < currentStage;
                const isCurrent = index === currentStage;
                const isPending = index > currentStage;

                return (
                  <div key={st.label} className="flex flex-col sm:items-center text-left sm:text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? isDelivered
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isDelayed
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                          : 'bg-slate-900 text-white ring-4 ring-slate-100'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                      {isPassed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2.5">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                        {st.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Partner & Milestone History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner & Destination Info Card */}
        <div className="card-subtle p-6 bg-white space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Delivery Partner</h3>
            {shipment.partnerName ? (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {shipment.partnerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{shipment.partnerName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{shipment.partnerVehicle || 'Standard Courier Vehicle'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {shipment.partnerPhone || 'Verified Partner'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Driver
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Partner dispatch pending
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Destination Address</h3>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{shipment.destinationCity || 'Customer Address'}</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">{shipment.destinationAddress || 'Standard Delivery'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Events History */}
        <div className="card-subtle p-6 bg-white lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipment Milestone History</h3>
            <span className="text-xs text-slate-400 font-mono">
              {(shipment.events || []).length} Milestones
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {(shipment.events || []).map((ev, i) => (
              <div key={ev.id || i} className="relative group">
                {/* Event node dot */}
                <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                  i === (shipment.events.length - 1)
                    ? 'bg-emerald-600'
                    : 'bg-slate-400'
                }`} />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {ev.status?.replace(/_/g, ' ')}
                    </span>
                    {ev.location && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ev.location}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto font-mono">
                      {new Date(ev.eventTimestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ev.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Logged by: <span className="font-medium text-slate-500">{ev.actorRole}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
