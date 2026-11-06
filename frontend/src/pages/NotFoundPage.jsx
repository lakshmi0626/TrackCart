import React from 'react';
import { Link } from 'react-router-dom';
import { PackageX, Home, Navigation } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <PackageX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-slate-500 text-sm max-w-md mt-2">
        The destination or shipment view you are looking for does not exist or may have been moved.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link to="/" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/track" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Navigation className="w-4 h-4" /> Live Tracking
        </Link>
      </div>
    </div>
  );
}
