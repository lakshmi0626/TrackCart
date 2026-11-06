import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Package, 
  Bell, 
  LogOut, 
  User, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  CheckCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, role, logout, loginDemo } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quickTrackId, setQuickTrackId] = useState('');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.isRead).length);
    } catch (err) {
      // quiet catch on unauth
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim())}`);
      setQuickTrackId('');
    }
  };

  const handleResetDemo = async () => {
    if (confirm("Reset database to clean initial demonstration dataset?")) {
      setSeeding(true);
      try {
        await api.seed.reset();
        alert("Demo data successfully refreshed!");
        window.location.reload();
      } catch (err) {
        alert("Reset failed: " + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ADMIN</span>;
      case 'DELIVERY_PARTNER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Truck className="w-3 h-3" /> PARTNER</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><User className="w-3 h-3" /> CUSTOMER</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-emerald-600 transition-colors">
              <Package className="w-5 h-5 text-emerald-400 group-hover:text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Track<span className="text-emerald-600">Cart</span></span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium tracking-wider uppercase text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">Enterprise</span>
            </div>
          </Link>
          {user && <div className="hidden md:block ml-2">{getRoleBadge()}</div>}
        </div>

        {/* Global Track Input */}
        <form onSubmit={handleQuickTrack} className="hidden lg:flex items-center relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Quick track (TRK-TC-DEMO01)..."
            value={quickTrackId}
            onChange={(e) => setQuickTrackId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Demo Role Switcher Dropdown */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
            <span className="text-slate-400 px-2 font-medium">Demo:</span>
            <button
              onClick={() => loginDemo('CUSTOMER')}
              className={`px-2 py-1 rounded font-medium transition-all ${role === 'CUSTOMER' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Switch to John Doe (Customer)"
            >
              Customer
            </button>
            <button
              onClick={() => loginDemo('DELIVERY_PARTNER')}
              className={`px-2 py-1 rounded font-medium transition-all ${role === 'DELIVERY_PARTNER' ? 'bg-white shadow-xs text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Switch to Marcus Vance (Delivery Partner)"
            >
              Partner
            </button>
            <button
              onClick={() => loginDemo('ADMIN')}
              className={`px-2 py-1 rounded font-medium transition-all ${role === 'ADMIN' ? 'bg-white shadow-xs text-purple-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Switch to System Admin"
            >
              Admin
            </button>
          </div>

          {/* Refresh Demo Data Button */}
          <button
            onClick={handleResetDemo}
            disabled={seeding}
            title="Reset and repopulate demo database"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${seeding ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle display theme"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Flyout */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-emerald-50/30' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {n.type === 'ORDER' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : n.type === 'SHIPMENT' ? (
                              <Truck className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
