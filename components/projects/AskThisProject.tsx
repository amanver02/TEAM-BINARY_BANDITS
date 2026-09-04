'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { AskAIResponse, AIEvidence } from '@/types';

interface AskThisProjectProps {
  projectId: string;
  projectTitle: string;
  onNavigateTab: (tab: 'overview' | 'financials' | 'milestones' | 'documents' | 'reports' | 'updates') => void;
}

const PRESET_QUESTIONS = [
  'What is the current status?',
  'Why does this project need attention?',
  'How much budget remains?',
  'Which milestones are overdue?',
  'What are the latest achievements?',
];

export function AskThisProject({ projectId, projectTitle, onNavigateTab }: AskThisProjectProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (qText?: string) => {
    const qToSubmit = qText || question;
    if (!qToSubmit.trim()) return;

    setLoading(true);
    setError(null);
    if (qText) setQuestion(qText);

    try {
      const res = await fetch(`/api/projects/${projectId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qToSubmit }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else if (json.data) {
        setResponse(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Ask This Project (Gemini AI)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded Q&A powered by Gemini using strictly this project&apos;s records. No external hallucinated facts.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Factual & Traceable
        </span>
      </div>

      {/* Preset Quick Questions */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Recommended Audit Questions
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(pq)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md transition-colors text-left"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask anything about ${projectTitle}...`}
          className="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Ask AI</span>
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Box */}
      {response && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Gemini Audit Response
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
              {response.answer}
            </p>
          </div>

          {/* Traceable Evidence */}
          {response.evidence && response.evidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>Supporting Evidence Records ({response.evidence.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.evidence.map((ev: AIEvidence, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col justify-between space-y-2 hover:border-indigo-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                        <span className="capitalize text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {ev.entity_type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">Tab: {ev.target_tab}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.snippet}</p>
                    </div>
                    <button
                      onClick={() => onNavigateTab(ev.target_tab)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1 border-t border-slate-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Source</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
