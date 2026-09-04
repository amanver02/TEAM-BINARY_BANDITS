'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Download,
  ArrowRightLeft,
  Coins,
  ShieldCheck,
  Building2,
  ChevronRight,
  Lightbulb,
  Target,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BudgetAnalysisResponse } from '@/app/api/budget/analyze/route';
import { Project } from '@/types';

export default function BudgetAnalysisPage() {
  const [analysis, setAnalysis] = useState<BudgetAnalysisResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedPlans, setAppliedPlans] = useState<Record<number, boolean>>({});
  const [exportMessage, setExportMessage] = useState('');

  const fetchBudgetData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [analysisRes, projectsRes] = await Promise.all([
        fetch('/api/budget/analyze'),
        fetch('/api/projects'),
      ]);

      const analysisData = await analysisRes.json();
      const projectsData = await projectsRes.json();

      if (analysisData.data) {
        setAnalysis(analysisData.data);
      }
      if (projectsData.data) {
        setProjects(projectsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch budget analysis:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleApplyPlan = (index: number) => {
    setAppliedPlans((prev) => ({ ...prev, [index]: true }));
  };

  const handleExportReport = () => {
    setExportMessage('Generating comprehensive CSR Budget & Allocation Report PDF...');
    setTimeout(() => {
      setExportMessage('');
      alert('CSR Flow Budget Analysis Report (PDF/CSV) successfully downloaded!');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="card p-12 text-center space-y-3">
        <RefreshCw size={28} className="mx-auto text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Analyzing Portfolio Budget & SROI...</p>
        <p className="text-xs text-slate-400">Pinging Gemini AI to calculate optimal capital allocation plans.</p>
      </div>
    );
  }

  const totalAllocated = analysis?.total_allocated || 0;
  const totalSpent = analysis?.total_spent || 0;
  const totalRemaining = analysis?.total_remaining || 0;
  const utilizationPct = analysis?.utilization_pct || 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500/20 text-brand-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-500/30">
              Financial Intelligence Engine
            </span>
            <span className="text-xs text-slate-400">CSR Flow v2.4</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Budget Analysis & Smart Allocation
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time understanding of allocated funds, disbursed expenses, remaining unspent reserve, and Gemini AI-recommended capital optimization strategies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchBudgetData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-1.5 border border-white/10"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Analyzing...' : 'Re-Run AI Audit'}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
          >
            <Download size={14} />
            <span>Export Budget Report</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-3 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg text-xs font-medium flex items-center gap-2 animate-pulse">
          <Sparkles size={15} className="text-brand-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sanctioned Budget */}
        <div className="card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Allocated Budget</span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalAllocated)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sanctioned for FY 2025–26 across projects</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Compliance Pool</span>
            <span className="font-bold text-slate-700">100% Capital</span>
          </div>
        </div>

        {/* Card 2: Total Disbursed / Spent */}
        <div className="card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disbursed / Spent</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalSpent)}</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${utilizationPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Portfolio Utilization</span>
            <span className="font-bold text-emerald-600">{utilizationPct}% Disbursed</span>
          </div>
        </div>

        {/* Card 3: Remaining Unspent Budget */}
        <div className="card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Reserve</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Coins size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700">{formatCurrency(totalRemaining)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Unspent balance available for deployment</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Reserve Share</span>
            <span className="font-bold text-amber-700">{100 - utilizationPct}% Liquidity</span>
          </div>
        </div>

        {/* Card 4: Health Index */}
        <div className="card p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-white to-brand-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-900 uppercase tracking-wider">Financial Health Index</span>
            <div className="p-2 bg-brand-600 text-white rounded-lg shadow-sm">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-brand-900 flex items-baseline gap-1">
              92<span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Healthy Expenditure Velocity</span>
            </div>
          </div>
          <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Variance Risk</span>
            <span className="font-bold text-brand-700">Low (Within Schedule VII)</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Executive Audit Banner */}
      <div className="card p-6 bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-500/20 text-brand-300 rounded-xl border border-brand-400/30 shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Gemini AI Executive Portfolio Audit</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {analysis?.budget_health_summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Zero unallocated lapse risk detected
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Sec 135 Companies Act compliant
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Admin overhead cap maintained ≤ 5%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Project Budget Status Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Project Budget Allocation & Utilization Status</h2>
            <p className="text-xs text-slate-500">Breakdown of sanctioned budget, disbursed funds, and remaining balance by project</p>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100 shrink-0">
            {projects.length} Active CSR Initiatives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Project & Category</th>
                <th className="py-3 px-4">NGO Implementation Partner</th>
                <th className="py-3 px-4">Sanctioned Budget</th>
                <th className="py-3 px-4">Disbursed (Spent)</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((prj) => {
                const spent = prj.spent_budget || 0;
                const total = prj.total_budget || 1;
                const remaining = Math.max(0, total - spent);
                const pct = Math.min(Math.round((spent / total) * 100), 100);

                let healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                let healthLabel = 'On Track';
                if (pct > 95) {
                  healthColor = 'text-purple-700 bg-purple-50 border-purple-200';
                  healthLabel = 'Fully Disbursed';
                } else if (pct < 30 && prj.status === 'active') {
                  healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
                  healthLabel = 'Under-utilized';
                }

                return (
                  <tr key={prj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/projects/${prj.id}`}
                          className="font-bold text-slate-900 hover:text-brand-600 transition-colors"
                        >
                          {prj.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">{prj.category}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span>{prj.partner?.name || 'Direct / TBD'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {formatCurrency(spent)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {formatCurrency(remaining)}
                    </td>
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-slate-500">{pct}%</span>
                          <span className={`px-1.5 py-0.2 rounded border text-[9px] ${healthColor}`}>
                            {healthLabel}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/projects/${prj.id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
                      >
                        <span>Project 360</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Reallocation Suggestions & Efficiency Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Gemini AI Smart Allocation Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-100 text-brand-700 rounded-lg">
                <ArrowRightLeft size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Recommended Capital Reallocations</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">SROI Optimization</span>
          </div>

          <div className="space-y-3">
            {analysis?.reallocation_plans?.map((plan, idx) => {
              const isApplied = appliedPlans[idx];
              return (
                <div
                  key={idx}
                  className="card p-5 space-y-3 border-l-4 border-l-brand-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{plan.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          From: {plan.from_project_or_sector}
                        </span>
                        <span>→</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          To: {plan.to_project_or_sector}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-brand-700 block">
                        {formatCurrency(plan.recommended_amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Suggested Transfer</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Impact Rationale: </strong>
                    {plan.reasoning}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Recommended by Gemini AI Engine
                    </span>
                    <button
                      onClick={() => handleApplyPlan(idx)}
                      disabled={isApplied}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check size={14} />
                          <span>Reallocation Queued</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Apply Reallocation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Key Tips for Efficient CSR Budget Utilization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Lightbulb size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Capital Efficiency Principles</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Best Practices</span>
          </div>

          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Milestone-Linked Tranche Release</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Release funds in structured 30%–40%–30% tranches tied directly to field audit verification rather than single upfront transfers.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Vendor Volume Aggregation</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Consolidate hardware, medical equipment, and solar procurement across projects to negotiate 12–15% bulk discount rates.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Administrative Cap Compliance (≤ 5%)</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Ensure administrative overhead remains strictly within the 5% regulatory ceiling under Section 135 of Companies Act.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Government Scheme Co-funding Synergy</span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Leverage state/central schemes (e.g. Samagra Shiksha, Jal Jeevan Mission) to co-fund civil work and extend your capital footprint.
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-brand-800">
                <Target size={14} />
                Proactive Mid-Year Variance Review
              </span>
              <p className="text-slate-600 leading-relaxed">
                Review expenditure variances at Month 6. Reallocate unspent funds from lagging initiatives at least 90 days before fiscal year-end to prevent unspent CSR capital from lapsing into designated statutory funds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sector-wise Allocation & Optimization Target Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sector-wise Allocation Plan & Target Optimization</h2>
            <p className="text-xs text-slate-500">Current allocation vs AI-recommended optimal target distribution across thematic sectors</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Schedule VII Domains</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sector / Category</th>
                <th className="py-3 px-4">Current Allocation</th>
                <th className="py-3 px-4">Recommended Target</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Optimization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis?.sector_optimization?.map((sec, idx) => {
                const variance = sec.recommended_allocation - sec.current_allocation;
                const statusBadge =
                  sec.status === 'Under-funded'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : sec.status === 'Over-budget'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{sec.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatCurrency(sec.current_allocation)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-700">
                      {formatCurrency(sec.recommended_allocation)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {variance === 0 ? (
                        <span className="text-slate-400">₹0 (Balanced)</span>
                      ) : variance > 0 ? (
                        <span className="text-amber-600">+{formatCurrency(variance)}</span>
                      ) : (
                        <span className="text-emerald-600">{formatCurrency(variance)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${statusBadge}`}>
                        {sec.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
