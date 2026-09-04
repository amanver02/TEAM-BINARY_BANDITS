'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { LogOut, Bell, ShieldCheck, Clock, Calendar, Sparkles } from 'lucide-react';
import { initials } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Live Date & Time State
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const displayName = user?.displayName ?? user?.email ?? 'Punit Kumar';

  return (
    <div className="sticky top-0 z-40 shrink-0">
      {/* Top Colorful Animated Gradient Strip */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 via-pink-500 to-emerald-400 animate-gradient-x" />

      <header className="h-16 glass-header border-b border-slate-200/80 flex items-center justify-between px-6 shadow-xs transition-all duration-300">
        {/* Left: Page Title & Search Bar */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          {title ? (
            <h1 className="text-base font-bold text-slate-900 tracking-tight shrink-0 flex items-center gap-2">
              <span>{title}</span>
            </h1>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 text-indigo-700 border border-indigo-200/60 rounded-full text-xs font-bold shrink-0 shadow-2xs hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>CSR Flow Enterprise</span>
            </div>
          )}
          <div className="w-full max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Center/Right: Live Date & Time Widget + Actions */}
        <div className="flex items-center gap-3">
          {/* Live Clock & Date Widget */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold tracking-wider">
              <Clock size={13} className="animate-pulse text-amber-400 shrink-0" />
              <span className="text-amber-300">{timeString || '10:55:13 AM'}</span>
            </div>
            <span className="text-slate-600 font-bold text-xs">•</span>
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
              <Calendar size={13} className="text-indigo-400 shrink-0" />
              <span className="group-hover:text-white transition-colors">{dateString || 'Fri, 04 Sep 2026'}</span>
            </div>
          </div>

          {/* Live Data Sync Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/80 text-emerald-800 border border-emerald-300/80 rounded-full text-[11px] font-bold shadow-2xs hover:shadow-md hover:scale-105 transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">Live Data Sync</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Compliance & Audit Alerts</span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    2 New
                  </span>
                </div>
                <div className="p-3 text-xs space-y-2 text-slate-600">
                  <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/70 hover:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-amber-900">Milestone Deadline</p>
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">In 2 days</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      Clean Water Kiosk Phase 1 audit submission due for review.
                    </p>
                  </div>

                  <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-blue-50/50 rounded-xl border border-indigo-200/70 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-indigo-900">Q1 Gemini Audit Summary</p>
                      <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">Ready</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 mt-1 leading-relaxed">
                      Digital Literacy budget utilization report uploaded.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown pill */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all duration-300 group-hover:scale-105">
                  {initials(displayName)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                  {displayName}
                </p>
                <span className="inline-block text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-1 border border-indigo-200/60 leading-none">
                  CSR Administrator
                </span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              id="topbar-signout"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:scale-105 ml-1"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
