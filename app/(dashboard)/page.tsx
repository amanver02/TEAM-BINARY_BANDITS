'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Users,
  Lightbulb,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { DashboardStats, Project, AIInsight, ActivityLog, Partner } from '@/types';
import { formatCurrency, PROJECT_STATUS_BADGE, PROJECT_STATUS_LABELS, formatRelativeTime } from '@/lib/utils';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import CreatePartnerModal from '@/components/partners/CreatePartnerModal';

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, partnersRes, insightsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/partners'),
        fetch('/api/insights'),
      ]);

      const projectsData = await projectsRes.json();
      const partnersData = await partnersRes.json();
      const insightsData = await insightsRes.json();

      const allProjects: Project[] = projectsData.data || [];
      const allPartners: Partner[] = partnersData.data || [];
      const allInsights: AIInsight[] = insightsData.data || [];

      // Calculate stats
      const total_projects = allProjects.length;
      const active_projects = allProjects.filter((p) => p.status === 'active').length;
      const total_budget = allProjects.reduce((sum, p) => sum + (p.total_budget || 0), 0);
      const total_spent = allProjects.reduce((sum, p) => sum + (p.spent_budget || 0), 0);

      setStats({
        total_projects,
        active_projects,
        total_budget,
        total_spent,
        projects_by_status: {
          planning: allProjects.filter((p) => p.status === 'planning').length,
          active: active_projects,
          on_hold: allProjects.filter((p) => p.status === 'on_hold').length,
          completed: allProjects.filter((p) => p.status === 'completed').length,
        },
      });

      setRecentProjects(allProjects.slice(0, 4));
      setPartners(allPartners);
      setInsights(allInsights.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const spentPercent = stats ? Math.round((stats.total_spent / (stats.total_budget || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR Flow Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise Social Responsibility & Impact Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Users size={15} />
            <span>Add Partner</span>
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <FolderKanban size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total CSR Projects</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {loading ? '—' : stats?.total_projects}
            </p>
            <p className="text-[11px] text-brand-600 font-medium mt-0.5">
              {stats?.active_projects} Active Initiatives
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Allocated Budget</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {loading ? '—' : formatCurrency(stats?.total_budget || 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Full Portfolio Total
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Budget Disbursed</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {loading ? '—' : formatCurrency(stats?.total_spent || 0)}
            </p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {spentPercent}% Disbursed
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Partners</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {loading ? '—' : partners.length}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              NGOs & Govt Agencies
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects & Budget distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Table Card */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Key Projects</h2>
                <p className="text-xs text-slate-500">Active and ongoing CSR initiatives</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading projects...</div>
              ) : recentProjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No projects found.</div>
              ) : (
                recentProjects.map((project) => {
                  const spentPct = Math.min(
                    Math.round(((project.spent_budget || 0) / (project.total_budget || 1)) * 100),
                    100
                  );
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${PROJECT_STATUS_BADGE[project.status]}`}>
                            {PROJECT_STATUS_LABELS[project.status]}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {project.category}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Partner: {project.partner?.name || 'Unassigned'}
                        </p>
                      </div>

                      <div className="sm:w-44 shrink-0 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Budget Spent</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(project.spent_budget || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${spentPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{spentPct}% utilized</span>
                          <span>Total: {formatCurrency(project.total_budget)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Overall Portfolio Status Distribution */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Portfolio Status Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-center">
                <p className="text-xs font-semibold text-blue-700">Planning</p>
                <p className="text-lg font-bold text-blue-900 mt-0.5">
                  {stats?.projects_by_status.planning || 0}
                </p>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-center">
                <p className="text-xs font-semibold text-emerald-700">Active</p>
                <p className="text-lg font-bold text-emerald-900 mt-0.5">
                  {stats?.projects_by_status.active || 0}
                </p>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100 text-center">
                <p className="text-xs font-semibold text-amber-700">On Hold</p>
                <p className="text-lg font-bold text-amber-900 mt-0.5">
                  {stats?.projects_by_status.on_hold || 0}
                </p>
              </div>
              <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200 text-center">
                <p className="text-xs font-semibold text-slate-600">Completed</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {stats?.projects_by_status.completed || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Insights & Activity Feed */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="card p-5 space-y-4 border-l-4 border-l-brand-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900">AI Risk Insights</h2>
              </div>
              <Link
                href="/insights"
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                View Hub
              </Link>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    {insight.severity === 'risk' && (
                      <ShieldAlert size={14} className="text-red-500 shrink-0" />
                    )}
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {insight.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {insight.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Implementing Partners Quick List */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Partners Overview</h2>
              <Link href="/partners" className="text-xs font-semibold text-brand-600">
                View Directory
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {partners.slice(0, 3).map((partner) => (
                <div key={partner.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{partner.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {partner.type}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {partner.project_count || 0} projects
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        partners={partners}
        onSuccess={loadData}
      />

      <CreatePartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
