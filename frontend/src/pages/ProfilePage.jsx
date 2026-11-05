import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Truck, Mail, Phone, Lock, Calendar, Camera, Check } from 'lucide-react';

const AVATAR_COLORS = [
  { name: 'Dark Slate', bg: 'bg-slate-900', text: 'text-white' },
  { name: 'Emerald', bg: 'bg-emerald-600', text: 'text-white' },
  { name: 'Indigo', bg: 'bg-indigo-600', text: 'text-white' },
  { name: 'Amber', bg: 'bg-amber-600', text: 'text-white' },
  { name: 'Rose', bg: 'bg-rose-600', text: 'text-white' },
];

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [selectedColor, setSelectedColor] = useState(
    localStorage.getItem('trackcart_avatar_color') || 'bg-slate-900'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSelectColor = (bg) => {
    setSelectedColor(bg);
    localStorage.setItem('trackcart_avatar_color', bg);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Identity Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review authenticated user credentials, role permissions, and avatar customization.
        </p>
      </div>

      <div className="card-subtle p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${selectedColor} text-white flex items-center justify-center font-bold text-2xl shadow-sm transition-colors`}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
              </p>
            </div>
          </div>

          {/* Avatar Palette Picker */}
          <div className="space-y-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avatar Accent</span>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.bg}
                  onClick={() => handleSelectColor(col.bg)}
                  className={`w-6 h-6 rounded-full ${col.bg} flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedColor === col.bg ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                  }`}
                  title={col.name}
                >
                  {selectedColor === col.bg && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
            {savedNotice && (
              <span className="text-[10px] text-emerald-600 font-semibold block animate-pulse">
                Theme accent saved!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</span>
            <p className="font-semibold text-slate-800">{user?.phone || '+1-555-0199'}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Access</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Role-Based Access Control (RBAC) Active
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password Encryption</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              BCrypt Hash (12 rounds)
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Session Protocol</span>
            <p className="font-semibold text-slate-800 font-mono text-[11px]">
              JSON Web Token (JWT) • HS256
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
