import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProjectStatus, MilestoneStatus, PartnerType } from '@/types';

// ─── Class Merge ─────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Date Formatting ─────────────────────────────────────────────────────────
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

// ─── File Size ────────────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Budget Progress ─────────────────────────────────────────────────────────
export function getBudgetPercent(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((spent / total) * 100), 100);
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning:  'Planning',
  active:    'Active',
  on_hold:   'On Hold',
  completed: 'Completed',
};

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  planning:  'badge-blue',
  active:    'badge-green',
  on_hold:   'badge-yellow',
  completed: 'badge-gray',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  overdue:     'Overdue',
};

export const MILESTONE_STATUS_BADGE: Record<MilestoneStatus, string> = {
  pending:     'badge-gray',
  in_progress: 'badge-blue',
  completed:   'badge-green',
  overdue:     'badge-red',
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  ngo:         'NGO',
  government:  'Government',
  corporate:   'Corporate',
  community:   'Community',
};

export const PARTNER_TYPE_BADGE: Record<PartnerType, string> = {
  ngo:         'badge-green',
  government:  'badge-blue',
  corporate:   'badge-indigo',
  community:   'badge-yellow',
};

// ─── Project Categories ───────────────────────────────────────────────────────
export const PROJECT_CATEGORIES = [
  'Education',
  'Healthcare',
  'Environment',
  'Women Empowerment',
  'Rural Development',
  'Skill Development',
  'Water & Sanitation',
  'Digital Literacy',
  'Child Welfare',
  'Disaster Relief',
  'Other',
];

// ─── Expense Categories ───────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  'Personnel',
  'Materials & Supplies',
  'Travel & Logistics',
  'Infrastructure',
  'Technology',
  'Training',
  'Communication',
  'Administrative',
  'Miscellaneous',
];

// ─── String Helpers ───────────────────────────────────────────────────────────
export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}
