import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', to: '/products', icon: Package },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  // Derive initial from email or organization name
  const userInitial = user?.email
    ? user.email[0].toUpperCase()
    : user?.organization_name
      ? user.organization_name[0].toUpperCase()
      : 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      {/* Brand / Logo */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white font-mono text-xs font-semibold tracking-wider transition-transform group-hover:scale-[1.02]">
            SF
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              StockFlow
            </span>
          </div>
        </NavLink>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-600 rounded"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                  ? 'bg-zinc-100 text-zinc-900 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`
              }
            >
              <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Area */}
      <div className="p-3 border-t border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-900 truncate" title={user?.email}>
                    {user?.email || 'Authenticated User'}
                  </p>
                    <p className="text-[11px] text-zinc-400 truncate" title={user?.organization_name}>
                      {user?.organization_name || 'Organization'}
                    </p>
                  </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        );

        return (
        <>
          {/* Desktop Static Sidebar */}
          <aside className="hidden md:block w-56 shrink-0 h-screen sticky top-0">
            {sidebarContent}
          </aside>

          {/* Mobile Drawer */}
          {isOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div
                className="fixed inset-0 bg-zinc-900/40 backdrop-blur-[1px]"
                onClick={onClose}
              />
              <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-150">
                {sidebarContent}
              </div>
            </div>
          )}
        </>
        );
}
