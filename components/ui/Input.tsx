import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
              'transition-colors duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
              icon && 'pl-9',
              error && 'border-red-400 focus:ring-red-500 focus:border-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
