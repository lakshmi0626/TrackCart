import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Truck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await api.deliveryPartners.getAll();
      setPartners(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = partners.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (p.fullName && p.fullName.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Fleet Management</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Registered Delivery Partners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor active drivers, vehicle types, performance ratings, and delivery completion rates.
          </p>
        </div>
      </div>

      <div className="card-subtle p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver name, license, vehicle..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total Fleet: {partners.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((partner) => (
          <div key={partner.id} className="card-subtle p-5 bg-white space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {partner.fullName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{partner.fullName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: TC-DP-{partner.id}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                partner.isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {partner.isAvailable ? 'Available' : 'On Route'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-semibold text-slate-800">{partner.vehicleType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plate Number:</span>
                <span className="font-mono font-bold text-slate-800">{partner.vehicleNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Driver License:</span>
                <span className="font-mono text-slate-700">{partner.licenseNumber}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{partner.rating?.toFixed(1) || '5.0'} Rating</span>
              </div>
              <div className="text-slate-600 font-medium text-[11px]">
                <strong className="text-slate-900">{partner.completedDeliveries}</strong> deliveries
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {partner.phone || 'N/A'}
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                <MapPin className="w-3 h-3 text-emerald-600" /> Live GPS Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
