import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Shield, Home, Search, MessageSquare, Heart, Hexagon, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  // ✅ FIX: auth from AuthContext only
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // ✅ keep notifications from AppContext
  const { notifications } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(
    n => !n.read && String(n.userId) === String(user?.id)
  ).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Uni<span className="text-amber-500">Hive</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-amber-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
              <Home className="w-4 h-4" /> Home
            </Link>

            <Link to="/hostels" className="text-gray-600 hover:text-amber-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
              <Search className="w-4 h-4" /> Browse Hostels
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/messages" className="text-gray-600 hover:text-amber-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>

                {/* ✅ FIXED */}
                <Link to="/dashboard" className="text-gray-600 hover:text-amber-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
                  <Heart className="w-4 h-4" /> Dashboard
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-amber-600 flex items-center gap-1.5 text-sm font-medium transition-colors">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="relative p-2 text-gray-500 hover:text-amber-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold min-w-[18px] min-h-[18px]">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* PROFILE */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {/* ✅ FIX: avatar fallback */}
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                      {user?.avatar || user?.full_name?.charAt(0)}
                    </div>

                    {/* ✅ FIX: correct name */}
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                          <Link
                            to="/debug"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Debug Page
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-amber-600 px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-lg transition-colors shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-4">
          <div className="px-4 pt-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 text-sm font-medium">
              <Home className="w-4 h-4" /> Home
            </Link>

            <Link to="/hostels" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 text-sm font-medium">
              <Search className="w-4 h-4" /> Browse Hostels
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 text-sm font-medium">
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>

                {/* ✅ FIXED */}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 text-sm font-medium">
                  <User className="w-4 h-4" /> Dashboard
                </Link>

                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 text-sm font-medium">
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 px-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}