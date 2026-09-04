import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-150',
  {
    variants: {
      variant: {
        blue:     'bg-blue-50 text-blue-700 ring-blue-200',
        green:    'bg-green-50 text-green-700 ring-green-200',
        yellow:   'bg-yellow-50 text-yellow-700 ring-yellow-200',
        red:      'bg-red-50 text-red-700 ring-red-200',
        gray:     'bg-slate-100 text-slate-600 ring-slate-200',
        indigo:   'bg-indigo-50 text-indigo-700 ring-indigo-200',
        emerald:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
        amber:    'bg-amber-50 text-amber-700 ring-amber-200',
        brand:    'bg-brand-50 text-brand-700 ring-brand-200',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
