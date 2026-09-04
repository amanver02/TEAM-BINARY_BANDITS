'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  description,
  children,
  className,
}: DrawerProps) {
  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-md bg-white shadow-xl border-slate-200 flex flex-col',
          'transition-transform duration-250 ease-out',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
              {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 shrink-0 mt-0.5"
              aria-label="Close drawer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
