'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { LogOut, Bell, ShieldCheck } from 'lucide-react';
import { initials } from '@/lib/utils';
import { useState } from 'react';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const displayName = user?.displayName ?? user?.email ?? 'CSR Manager';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 shadow-2xs">
      {/* Left: Page Title & Search Bar */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        {title ? (
          <h1 className="text-base font-bold text-slate-900 tracking-tight shrink-0">{title}</h1>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CSR Flow Enterprise</span>
          </div>
        )}
        <div className="w-full max-w-md">
          <GlobalSearch />
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Data Sync</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Audit Alerts</span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">2 New</span>
              </div>
              <div className="p-3 text-xs space-y-2 text-slate-600">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="font-semibold text-slate-800">Milestone Due</p>
                  <p className="text-[11px] text-slate-500">Clean Water Kiosk Phase 1 due in 2 days.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="font-semibold text-slate-800">Q1 Report Uploaded</p>
                  <p className="text-[11px] text-slate-500">Digital Literacy audit summary ready.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {initials(displayName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{displayName}</p>
              <p className="text-[10px] font-medium text-indigo-600 leading-none mt-1">CSR Administrator</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            id="topbar-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
