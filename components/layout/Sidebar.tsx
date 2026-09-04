'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Lightbulb,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'Partners',
    href: '/partners',
    icon: Users,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'AI Insights',
    href: '/insights',
    icon: Lightbulb,
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
    <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-slate-200 h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 bg-brand-700 rounded-md">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">CSR360</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">Enterprise Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map(({ label, href, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-link', isActive(href, exact) && 'active')}
            aria-current={isActive(href, exact) ? 'page' : undefined}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(href, exact) && (
              <ChevronRight size={14} className="text-brand-500 shrink-0" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-0.5">
        {bottomItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-link', isActive(href) && 'active')}
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
