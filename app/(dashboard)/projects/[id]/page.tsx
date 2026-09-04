'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Wallet,
  Target,
  Receipt,
  MessageSquare,
  FileText,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Users,
  ShieldCheck,
  BarChart3,
  Trash2,
  FileUp,
} from 'lucide-react';
import {
  Project,
  Milestone,
  Expense,
  ProjectUpdate,
  Document,
  ProjectReport,
  ProjectHealth,
} from '@/types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABELS,
  MILESTONE_STATUS_BADGE,
  MILESTONE_STATUS_LABELS,
} from '@/lib/utils';

import AddMilestoneModal from '@/components/projects/AddMilestoneModal';
import AddExpenseModal from '@/components/projects/AddExpenseModal';
import AddUpdateModal from '@/components/projects/AddUpdateModal';
import { AskThisProject } from '@/components/projects/AskThisProject';
import { ReportSummaryModal } from '@/components/projects/ReportSummaryModal';
import { AddDocumentModal } from '@/components/projects/AddDocumentModal';
import { AddReportModal } from '@/components/projects/AddReportModal';

type TabType = 'overview' | 'financials' | 'milestones' | 'documents' | 'reports' | 'updates' | 'ai';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [health, setHealth] = useState<ProjectHealth>({
    status: 'Healthy',
    score: 90,
    reasons: ['Project metrics on schedule'],
  });
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Selected report for AI summary modal
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);

  // Modals open state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const result = await res.json();
      if (result.data) {
        setProject(result.data.project);
        setMilestones(result.data.milestones || []);
        setExpenses(result.data.expenses || []);
        setUpdates(result.data.updates || []);
        setDocuments(result.data.documents || []);
        setReports(result.data.reports || []);
        if (result.data.health) setHealth(result.data.health);
      }
    } catch (err) {
      console.error('Failed to load project detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' });
      fetchProjectData();
    } catch (err) {
      console.error('Delete document failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center text-xs text-slate-400">
        Loading Project 360 data from Supabase...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Project Not Found</p>
        <Link href="/projects" className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const totalBudget = Number(project.total_budget) || 1;
  const spentBudget = Number(project.spent_budget) || expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingBudget = Math.max(0, totalBudget - spentBudget);
  const spentPct = Math.min(Math.round((spentBudget / totalBudget) * 100), 100);

  const completedMilestonesCount = milestones.filter((m) => m.status === 'completed').length;

  const HEALTH_BADGES: Record<string, string> = {
    Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Good: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Needs Attention': 'bg-amber-50 text-amber-700 border-amber-200',
    'At Risk': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${PROJECT_STATUS_BADGE[project.status]}`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              <span className="text-xs font-medium text-slate-500">• {project.category}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${HEALTH_BADGES[health.status]}`}>
                Health: {health.status} ({health.score}/100)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload Doc</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask This Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500">Total Budget</div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500">Disbursed / Spent</div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(spentBudget)}</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${spentPct}%` }} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500">Milestone Progress</div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {completedMilestonesCount} / {milestones.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {milestones.length > 0 ? `${Math.round((completedMilestonesCount / milestones.length) * 100)}% completed` : 'No milestones'}
          </p>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500">Project Partner</div>
          <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
            {project.partner ? project.partner.name : 'Unassigned'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
            {project.partner ? project.partner.type : 'N/A'}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'financials', label: `Financials (${expenses.length})`, icon: Wallet },
          { key: 'milestones', label: `Milestones (${milestones.length})`, icon: Target },
          { key: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { key: 'reports', label: `Reports (${reports.length})`, icon: BarChart3 },
          { key: 'updates', label: `Updates (${updates.length})`, icon: MessageSquare },
          { key: 'ai', label: 'Ask AI (Gemini)', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors shrink-0 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Project Summary</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {project.description || 'No detailed project description available.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Target Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {project.location || 'Maharashtra & PAN-India hamlets'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Target Beneficiaries</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {project.beneficiaries || '4,000+ Primary School Children'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Start Date</span>
                  <span className="font-medium text-slate-800">{formatDate(project.start_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">End Date</span>
                  <span className="font-medium text-slate-800">{project.end_date ? formatDate(project.end_date) : 'Ongoing'}</span>
                </div>
              </div>
            </div>

            {/* Transparent Project Health Breakdown */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Transparent Health Evaluation</h3>
                <span className="text-xs font-mono text-slate-400">Rule-based scoring</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Health Index Score</span>
                  <span className="font-bold text-slate-900">{health.score} / 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      health.score >= 80 ? 'bg-emerald-500' : health.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${health.score}%` }}
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluation Factors:</span>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc pl-5">
                    {health.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Partner Card & Recent Activity */}
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Implementing Partner</h3>
              {project.partner ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{project.partner.name}</div>
                    <div className="text-slate-400 uppercase tracking-wider text-[10px] mt-0.5">{project.partner.type}</div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{project.partner.description}</p>
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-500">
                    <div>Contact: {project.partner.contact_name || 'N/A'}</div>
                    <div>Email: {project.partner.contact_email || 'N/A'}</div>
                    <div>Phone: {project.partner.contact_phone || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No partner assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Financials */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-xs text-slate-500 font-medium">Total Sanctioned Budget</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500 font-medium">Spent to Date</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(spentBudget)}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500 font-medium">Remaining Unspent</div>
              <div className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(remainingBudget)}</div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recorded Expenses ({expenses.length})</h3>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Expense</span>
              </button>
            </div>

            {expenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No expenses recorded for this project.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 text-slate-500">{formatDate(exp.date)}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{exp.category}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-md">{exp.description}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900">
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Milestones */}
      {activeTab === 'milestones' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Project Timeline & Milestones ({milestones.length})</h3>
            <button
              onClick={() => setIsMilestoneModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No milestones recorded.</div>
          ) : (
            <div className="space-y-3 pt-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${MILESTONE_STATUS_BADGE[m.status]}`}>
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900">{m.title}</h4>
                    </div>
                    {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">Due: {formatDate(m.due_date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {activeTab === 'documents' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Document Vault ({documents.length})</h3>
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No documents uploaded for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Reports */}
      {activeTab === 'reports' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Audit & Progress Reports ({reports.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any report to view or generate Gemini AI summary.</p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No reports submitted yet.</div>
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
                      {rep.summary_json && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          AI Summarized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Submitted on {formatDate(rep.created_at)}</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-md flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View / Summarize</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Updates */}
      {activeTab === 'updates' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Field Updates ({updates.length})</h3>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Update</span>
            </button>
          </div>

          {updates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No field updates posted.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {updates.map((upd) => (
                <div key={upd.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">{upd.title}</h4>
                    <span className="text-xs text-slate-400">{formatDateTime(upd.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{upd.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Ask AI (Gemini) */}
      {activeTab === 'ai' && (
        <AskThisProject
          projectId={project.id}
          projectTitle={project.title}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Modals */}
      <AddMilestoneModal
        projectId={project.id}
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      <AddExpenseModal
        projectId={project.id}
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      <AddUpdateModal
        projectId={project.id}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      <AddDocumentModal
        projectId={project.id}
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      <AddReportModal
        projectId={project.id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      {selectedReport && (
        <ReportSummaryModal
          report={selectedReport}
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          onSummaryGenerated={() => fetchProjectData()}
        />
      )}
    </div>
  );
}
