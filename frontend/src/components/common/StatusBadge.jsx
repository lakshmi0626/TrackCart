import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  Navigation, 
  XCircle,
  AlertTriangle 
} from 'lucide-react';

const STATUS_CONFIGS = {
  PENDING: {
    label: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    pulsing: true,
    Icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    pulsing: false,
    Icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'Processing',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    pulsing: true,
    Icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    dotColor: 'bg-sky-500',
    pulsing: true,
    Icon: Truck,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-500',
    pulsing: true,
    Icon: Navigation,
  },
  DELIVERED: {
    label: 'Delivered',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    pulsing: false,
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
    pulsing: false,
    Icon: XCircle,
  },
  DELAYED: {
    label: 'Delayed',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    pulsing: true,
    Icon: AlertTriangle,
  },
};

export default function StatusBadge({ status, showIcon = true, size = 'sm' }) {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_CONFIGS[normalized] || {
    label: status || 'Unknown',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400',
    pulsing: false,
    Icon: Package,
  };

  const { label, bgColor, textColor, borderColor, dotColor, pulsing, Icon } = config;

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1 text-xs gap-2' 
    : 'px-2.5 py-0.5 text-[10px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${bgColor} ${textColor} ${borderColor} ${sizeClasses}`}
      aria-label={`Status: ${label}`}
    >
      <span className="relative flex h-2 w-2">
        {pulsing && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {showIcon && <Icon className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />}
      <span>{label}</span>
    </span>
  );
}
