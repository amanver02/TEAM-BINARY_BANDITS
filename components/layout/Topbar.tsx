'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { LogOut, Bell } from 'lucide-react';
import { initials } from '@/lib/utils';
import { useState } from 'react';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const displayName = user?.displayName ?? user?.email ?? 'User';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: page title or search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        {title ? (
          <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
        ) : null}
        <GlobalSearch />
      </div>

      {/* Right: user actions */}
      <div className="flex items-center gap-2">
        {/* Notifications placeholder */}
        <button
          aria-label="Notifications"
          className="btn-ghost p-2 relative"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
        </button>

        {/* User avatar + email */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 ml-1">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
            {initials(displayName)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          id="topbar-signout"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Sign out"
          className="btn-ghost p-2 text-slate-500 hover:text-red-600"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
