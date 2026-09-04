'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Calendar,
  Building2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Project, Partner, ProjectStatus } from '@/types';
import {
  formatCurrency,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABELS,
  PROJECT_CATEGORIES,
  formatDate,
} from '@/lib/utils';
import CreateProjectModal from '@/components/projects/CreateProjectModal';

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'All Projects', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
];

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery) params.set('query', searchQuery);

      const [prjRes, ptnRes] = await Promise.all([
        fetch(`/api/projects?${params.toString()}`),
        fetch('/api/partners'),
      ]);

      const prjData = await prjRes.json();
      const ptnData = await ptnRes.json();

      setProjects(prjData.data || []);
      setPartners(ptnData.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate social responsibility initiatives, milestones, and expenditures
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="input text-xs pl-9 py-2"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input text-xs py-2 w-full sm:w-56"
            >
              <option value="all">All Categories</option>
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="card p-12 text-center text-xs text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <FolderKanban size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No projects found</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const spent = project.spent_budget || 0;
            const total = project.total_budget || 1;
            const spentPct = Math.min(Math.round((spent / total) * 100), 100);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${PROJECT_STATUS_BADGE[project.status]}`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {project.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  {/* Budget Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Disbursed</span>
                      <span className="text-slate-900">{formatCurrency(spent)}</span>
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

                  {/* Partner & Date footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{project.partner?.name || 'No partner'}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <Calendar size={13} />
                      <span>{formatDate(project.start_date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partners={partners}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
