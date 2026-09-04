'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { AIInsight } from '@/types';

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      setInsights(data.data || []);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      const data = await res.json();
      if (data.data) {
        setInsights(data.data);
      }
    } catch (err) {
      console.error('AI Audit failed:', err);
    } finally {
      setAuditing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'risk':
        return { label: 'High Risk', class: 'bg-red-50 text-red-700 border-red-200', icon: ShieldAlert };
      case 'warning':
        return { label: 'Warning', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
      case 'positive':
        return { label: 'Positive Milestone', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      default:
        return { label: 'Informational', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Info };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Insights & Audit Hub</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Google Gemini 1.5 Flash — Autonomous CSR risk, compliance & budget analysis
            </p>
          </div>
        </div>

        <button
          onClick={runAudit}
          disabled={auditing}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-2 shrink-0"
        >
          <RefreshCw size={14} className={auditing ? 'animate-spin' : ''} />
          <span>{auditing ? 'Running Gemini Audit...' : 'Run Portfolio AI Audit'}</span>
        </button>
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="card p-12 text-center text-xs text-slate-400">Loading AI insights...</div>
      ) : insights.length === 0 ? (
        <div className="card p-12 text-center text-xs text-slate-400">
          No insights generated. Click "Run Portfolio AI Audit" to trigger Gemini analysis.
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((item) => {
            const badge = getSeverityBadge(item.severity);
            const Icon = badge.icon;

            return (
              <div key={item.id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.class}`}>
                      <Icon size={13} />
                      <span>{badge.label}</span>
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>

                {item.data_points && item.data_points.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Data Signals:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700">
                      {item.data_points.map((dp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                          <span>{dp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
