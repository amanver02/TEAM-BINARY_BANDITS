'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Lightbulb,
  FileText,
  Wallet,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    exact: true,
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    accent: 'from-indigo-500 to-purple-600',
  },
  {
    label: 'Budget Analysis',
    href: '/budget',
    icon: Wallet,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: FileText,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    label: 'Partners',
    href: '/partners',
    icon: Users,
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    accent: 'from-violet-500 to-purple-600',
  },
  {
    label: 'AI Insights',
    href: '/insights',
    icon: Lightbulb,
    accent: 'from-rose-500 to-pink-600',
  },
];

const bottomItems = [
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-slate-200/90 h-full shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50">
        <div className="relative w-10 h-10 shrink-0 hover:scale-105 transition-transform duration-300">
          <Image
            src="/logo.png"
            alt="CSR Flow Logo"
            width={40}
            height={40}
            className="object-contain drop-shadow-xs"
            priority
          />
        </div>
        <div className="overflow-hidden">
          <p className="text-base font-black text-slate-900 leading-none tracking-tight flex items-center gap-1">
            <span>CSR Flow</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          <p className="text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-none mt-1 tracking-wider uppercase">
            Plan • Track • Impact
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Main Navigation</span>
          <Sparkles size={11} className="text-indigo-400" />
        </p>

        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 group relative',
                active
                  ? 'bg-gradient-to-r from-brand-50 via-indigo-50/60 to-brand-50 text-brand-700 font-bold shadow-xs border border-brand-200/80'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  active
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                )}
              >
                <Icon size={15} className="shrink-0" />
              </div>
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight size={14} className="text-brand-600 shrink-0 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200',
                active
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <Icon size={16} className="shrink-0 text-slate-400" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
