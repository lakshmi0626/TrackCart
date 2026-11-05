import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, User, Truck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginDemo(role);
      redirectUser(user.role);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'DELIVERY_PARTNER') navigate('/partner');
    else navigate('/customer');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-slate-900 text-white items-center justify-center shadow-sm mb-1">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to TrackCart</h1>
          <p className="text-xs text-slate-500">Sign in to your intelligent logistics dashboard</p>
        </div>

        {/* Quick Demo Switch Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Instant Demo Sign-in
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('CUSTOMER')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center group"
            >
              <User className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Customer</span>
              <span className="text-[10px] text-slate-400">John Doe</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('DELIVERY_PARTNER')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-200 transition-all text-center group"
            >
              <Truck className="w-4 h-4 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Partner</span>
              <span className="text-[10px] text-slate-400">Marcus Vance</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-200 transition-all text-center group"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-400">Enterprise</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="card-subtle p-6 bg-white">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@trackcart.io"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400 font-mono">Demo: Customer@123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
