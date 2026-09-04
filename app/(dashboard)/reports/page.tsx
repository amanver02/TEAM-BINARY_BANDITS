'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Printer, PieChart, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ReportSummaryModal } from '@/components/projects/ReportSummaryModal';

interface ReportData {
  stats: {
    total_projects: number;
    active_projects: number;
    total_budget: number;
    total_spent: number;
  };
  categoryTotals: Record<string, { allocated: number; spent: number; count: number }>;
  partnerTotals: Record<string, { name: string; projectCount: number; totalBudget: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="card p-12 text-center text-xs text-slate-400">Generating CSR report metrics...</div>;
  }

  const categories = data?.categoryTotals ? Object.keys(data.categoryTotals) : [];
  const partners = data?.partnerTotals ? Object.values(data.partnerTotals) : [];

  const totalSpentPct = data
    ? Math.round((data.stats.total_spent / (data.stats.total_budget || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR & ESG Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Budget utilization, category breakdown, and compliance reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total CSR Budget Allocated
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(data?.stats.total_budget || 0)}
          </p>
          <p className="text-xs text-slate-500">{data?.stats.total_projects} Active & Planned Projects</p>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Funds Disbursed
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(data?.stats.total_spent || 0)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">{totalSpentPct}% Disbursed</p>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Unutilized Reserve
          </p>
          <p className="text-2xl font-bold text-brand-700">
            {formatCurrency((data?.stats.total_budget || 0) - (data?.stats.total_spent || 0))}
          </p>
          <p className="text-xs text-slate-500">Available for Q3/Q4 Allocation</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">
            Sector-Wise Budget Allocation & Expenditure
          </h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Initiatives</th>
                <th>Allocated Budget</th>
                <th>Total Spent</th>
                <th>Utilization %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {categories.map((cat) => {
                const info = data!.categoryTotals[cat];
                const pct = Math.min(Math.round((info.spent / (info.allocated || 1)) * 100), 100);
                return (
                  <tr key={cat}>
                    <td className="font-bold text-slate-800">{cat}</td>
                    <td>{info.count}</td>
                    <td className="font-semibold text-slate-900">{formatCurrency(info.allocated)}</td>
                    <td className="font-semibold text-emerald-700">{formatCurrency(info.spent)}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-bold text-slate-700">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementing Partners Breakdown */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Partner Portfolio Allocation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.name} className="p-4 bg-slate-50 border border-slate-200/70 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900">{p.name}</p>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Projects Managed:</span>
                <span className="font-semibold">{p.projectCount}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Portfolio Budget:</span>
                <span className="font-bold text-slate-900">{formatCurrency(p.totalBudget)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Progress & Audit Reports */}
      <SubmittedReportsSection />
    </div>
  );
}

function SubmittedReportsSection() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const loadReports = async () => {
    try {
      const res = await fetch('/api/reports?list=true');
      const json = await res.json();
      if (json.data) setReports(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Submitted Compliance & Audit Reports</h2>
          <p className="text-xs text-slate-500">Click any report to generate or view Gemini AI summary breakdown.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">No reports submitted.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep)}
              className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">{rep.title}</span>
                  {rep.project && (
                    <span className="text-xs text-slate-500 font-medium">({rep.project.title})</span>
                  )}
                  {rep.summary_json && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      AI Summarized
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Submitted on {new Date(rep.created_at).toLocaleDateString()}</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-md flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>View / Summarize</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportSummaryModal
          report={selectedReport}
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          onSummaryGenerated={() => loadReports()}
        />
      )}
    </div>
  );
}
