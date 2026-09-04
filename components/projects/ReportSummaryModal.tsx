'use client';

import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, CheckCircle2, AlertTriangle, Wallet, ArrowRight, X } from 'lucide-react';
import { ProjectReport, ReportSummary } from '@/types';

interface ReportSummaryModalProps {
  report: ProjectReport;
  isOpen: boolean;
  onClose: () => void;
  onSummaryGenerated?: (newSummary: ReportSummary) => void;
}

export function ReportSummaryModal({ report, isOpen, onClose, onSummaryGenerated }: ReportSummaryModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(report.summary_json || null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/reports/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else if (json.data) {
        setSummary(json.data);
        if (onSummaryGenerated) onSummaryGenerated(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summary generation failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
              <p className="text-xs text-slate-400">
                Uploaded on {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between p-4 bg-indigo-50/60 border border-indigo-100 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-indigo-900">Gemini Audit Report Summarizer</p>
              <p className="text-xs text-indigo-700 mt-0.5">
                Extract key achievements, risks, financial highlights, and next steps.
              </p>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={analyzing}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{summary ? 'Re-Generate Summary' : 'Generate Summary'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Analyzing indicator */}
          {analyzing && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">Analyzing report content with Gemini API...</p>
              <p className="text-xs text-slate-400">Extracting compliance metrics, achievements, and financial items.</p>
            </div>
          )}

          {/* Render Summary Sections */}
          {!analyzing && summary && (
            <div className="space-y-6">
              {/* Key Achievements */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Achievements
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700">
                  {summary.key_achievements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Important Issues */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Important Issues
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700">
                  {summary.important_issues.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Financial Highlights */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  Financial Highlights
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700">
                  {summary.financial_highlights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Next Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  Next Actions
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700">
                  {summary.next_actions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!analyzing && !summary && (
            <div className="py-12 text-center text-xs text-slate-400">
              Click &quot;Generate Summary&quot; above to run Gemini AI report analysis.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
