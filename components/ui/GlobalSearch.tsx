'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderKanban, FileText, BarChart3, Target, Building2, X, Loader2 } from 'lucide-react';

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    projects: Array<{ id: string; title: string; subtitle: string; url: string }>;
    documents: Array<{ id: string; title: string; subtitle: string; url: string }>;
    reports: Array<{ id: string; title: string; subtitle: string; url: string }>;
    milestones: Array<{ id: string; title: string; subtitle: string; url: string }>;
    partners: Array<{ id: string; title: string; subtitle: string; url: string }>;
  }>({ projects: [], documents: [], reports: [], milestones: [], partners: [] });

  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], documents: [], reports: [], milestones: [], partners: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.data) {
          setResults(json.data);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-between gap-3 w-full max-w-sm px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-md transition-colors"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search projects, docs, reports...</span>
        </span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-300 rounded">
          Ctrl K
        </kbd>
      </button>
    );
  }

  const navigateTo = (url: string) => {
    setOpen(false);
    setQuery('');
    router.push(url);
  };

  const totalMatches =
    results.projects.length +
    results.documents.length +
    results.reports.length +
    results.milestones.length +
    results.partners.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, documents, reports, milestones, partners..."
            autoFocus
            className="w-full text-sm text-slate-900 bg-transparent border-none focus:outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search across Projects, Documents, Reports, Milestones, and CSR Partners...
            </div>
          )}

          {query.trim() && !loading && totalMatches === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for <span className="font-semibold">&quot;{query}&quot;</span>.
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" />
                Projects ({results.projects.length})
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(p.url)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">{p.title}</div>
                      <div className="text-xs text-slate-400">{p.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Documents ({results.documents.length})
              </div>
              <div className="space-y-1">
                {results.documents.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigateTo(d.url)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{d.title}</div>
                      <div className="text-xs text-slate-400">{d.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reports */}
          {results.reports.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Reports ({results.reports.length})
              </div>
              <div className="space-y-1">
                {results.reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigateTo(r.url)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{r.title}</div>
                      <div className="text-xs text-slate-400">{r.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {results.milestones.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Milestones ({results.milestones.length})
              </div>
              <div className="space-y-1">
                {results.milestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigateTo(m.url)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{m.title}</div>
                      <div className="text-xs text-slate-400">{m.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Partners */}
          {results.partners.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Partners ({results.partners.length})
              </div>
              <div className="space-y-1">
                {results.partners.map((ptn) => (
                  <button
                    key={ptn.id}
                    onClick={() => navigateTo(ptn.url)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{ptn.title}</div>
                      <div className="text-xs text-slate-400">{ptn.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Press ESC to close</span>
          <span>CSR Flow Unified Search</span>
        </div>
      </div>
    </div>
  );
}
