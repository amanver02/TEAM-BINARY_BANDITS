import { createServerClient } from '@/lib/supabase/server';
import {
  mockProjects,
  mockPartners,
  mockMilestones,
  mockExpenses,
  mockDocuments,
  mockProjectUpdates,
  mockActivityLog,
  mockAIInsights,
  mockReports,
} from '@/lib/mock-data';
import {
  Project,
  Partner,
  Milestone,
  Expense,
  Document,
  ProjectReport,
  ReportSummary,
  ProjectUpdate,
  ActivityLog,
  AIInsight,
  DashboardStats,
  CreateProjectInput,
  CreatePartnerInput,
  CreateMilestoneInput,
  CreateExpenseInput,
  CreateUpdateInput,
  CreateReportInput,
  ProjectHealth,
  HealthStatus,
} from '@/types';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase')
  );
}

// Memory cache for transient mutations during demo mode
let memoryProjects: Project[] = [...mockProjects];
let memoryPartners: Partner[] = [...mockPartners];
let memoryMilestones: Milestone[] = [...mockMilestones];
let memoryExpenses: Expense[] = [...mockExpenses];
let memoryUpdates: ProjectUpdate[] = [...mockProjectUpdates];
let memoryDocuments: Document[] = [...mockDocuments];
let memoryReports: ProjectReport[] = [...mockReports];
let memoryActivityLog: ActivityLog[] = [...mockActivityLog];
let memoryInsights: AIInsight[] = [...mockAIInsights];

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data: projects, error } = await supabase.from('projects').select('status, total_budget');
      const { data: expenses } = await supabase.from('expenses').select('amount');

      if (!error && projects) {
        const total_projects = projects.length;
        const active_projects = projects.filter((p) => p.status === 'active').length;
        const total_budget = projects.reduce((sum, p) => sum + Number(p.total_budget || 0), 0);
        const total_spent = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const projects_by_status = {
          planning: projects.filter((p) => p.status === 'planning').length,
          active: projects.filter((p) => p.status === 'active').length,
          on_hold: projects.filter((p) => p.status === 'on_hold').length,
          completed: projects.filter((p) => p.status === 'completed').length,
        };

        return {
          total_projects,
          active_projects,
          total_budget,
          total_spent,
          projects_by_status,
        };
      }
    } catch (err) {
      console.warn('[DataService] Supabase getDashboardStats fallback to mock data:', err);
    }
  }

  // Fallback / Mock calculations
  const total_projects = memoryProjects.length;
  const active_projects = memoryProjects.filter((p) => p.status === 'active').length;
  const total_budget = memoryProjects.reduce((sum, p) => sum + (p.total_budget || 0), 0);
  const total_spent = memoryProjects.reduce((sum, p) => sum + (p.spent_budget || 0), 0);

  const projects_by_status = {
    planning: memoryProjects.filter((p) => p.status === 'planning').length,
    active: memoryProjects.filter((p) => p.status === 'active').length,
    on_hold: memoryProjects.filter((p) => p.status === 'on_hold').length,
    completed: memoryProjects.filter((p) => p.status === 'completed').length,
  };

  return {
    total_projects,
    active_projects,
    total_budget,
    total_spent,
    projects_by_status,
  };
}

export async function getProjects(filters?: {
  status?: string;
  category?: string;
  query?: string;
}): Promise<Project[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      let query = supabase.from('projects').select(`
        *,
        partner:partners(*)
      `).order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Project[];
      }
    } catch (err) {
      console.warn('[DataService] Supabase getProjects fallback:', err);
    }
  }

  // Fallback filtering
  let result = [...memoryProjects];
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters?.category && filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Attach partner info
  return result.map((p) => ({
    ...p,
    partner: memoryPartners.find((ptn) => ptn.id === p.partner_id) || null,
  }));
}

export function calculateProjectHealth(
  project: Project,
  milestones: Milestone[] = [],
  expenses: Expense[] = [],
  updates: ProjectUpdate[] = [],
  reports: ProjectReport[] = []
): ProjectHealth {
  const reasons: string[] = [];
  let score = 100;

  const totalBudget = Number(project.total_budget) || 1;
  const totalSpent = Number(project.spent_budget) || expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100);

  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const overdueMilestones = milestones.filter((m) => m.status === 'overdue').length;
  const totalMilestones = milestones.length;
  const completionPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 50;

  // 1. Overdue milestone penalties
  if (overdueMilestones > 0) {
    score -= overdueMilestones * 15;
    reasons.push(`${overdueMilestones} milestone(s) are overdue.`);
  }

  // 2. Budget utilization vs completion imbalance
  if (budgetUtilization > completionPct + 20) {
    score -= 20;
    reasons.push(`Budget utilization (${budgetUtilization}%) is higher than project milestone completion (${completionPct}%).`);
  } else if (budgetUtilization > 90 && completionPct < 90) {
    score -= 15;
    reasons.push(`High budget utilization (${budgetUtilization}%) relative to total milestone completion.`);
  }

  // 3. Reporting and field updates check
  if (project.status === 'active' && updates.length === 0) {
    score -= 10;
    reasons.push(`No recent field updates recorded.`);
  }
  if (project.status === 'active' && reports.length === 0) {
    score -= 10;
    reasons.push(`No compliance/audit reports uploaded.`);
  }

  if (reasons.length === 0) {
    reasons.push(`All ${completedMilestones} completed milestones on track with healthy budget utilization (${budgetUtilization}%).`);
  }

  score = Math.max(0, Math.min(100, score));

  let status: HealthStatus = 'Healthy';
  if (score < 50) {
    status = 'At Risk';
  } else if (score < 70) {
    status = 'Needs Attention';
  } else if (score < 85) {
    status = 'Good';
  }

  return { status, score, reasons };
}

export async function getProjectById(id: string): Promise<{
  project: Project | null;
  milestones: Milestone[];
  expenses: Expense[];
  updates: ProjectUpdate[];
  documents: Document[];
  reports: ProjectReport[];
  health: ProjectHealth;
}> {
  let fetchedProject: Project | null = null;
  let fetchedMilestones: Milestone[] = [];
  let fetchedExpenses: Expense[] = [];
  let fetchedUpdates: ProjectUpdate[] = [];
  let fetchedDocuments: Document[] = [];
  let fetchedReports: ProjectReport[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data: project } = await supabase
        .from('projects')
        .select('*, partner:partners(*)')
        .eq('id', id)
        .single();

      if (project) {
        fetchedProject = project as Project;

        const { data: milestones } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', id)
          .order('due_date', { ascending: true });
        if (milestones) fetchedMilestones = milestones as Milestone[];

        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .eq('project_id', id)
          .order('date', { ascending: false });
        if (expenses) fetchedExpenses = expenses as Expense[];

        const { data: updates } = await supabase
          .from('project_updates')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });
        if (updates) fetchedUpdates = updates as ProjectUpdate[];

        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });
        if (documents) fetchedDocuments = documents as Document[];

        const { data: reports } = await supabase
          .from('reports')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });
        if (reports) fetchedReports = reports as ProjectReport[];
      }
    } catch (err) {
      console.warn('[DataService] Supabase getProjectById fallback:', err);
    }
  }

  if (!fetchedProject) {
    const p = memoryProjects.find((prj) => prj.id === id) || null;
    if (!p) {
      return {
        project: null,
        milestones: [],
        expenses: [],
        updates: [],
        documents: [],
        reports: [],
        health: { status: 'Needs Attention', score: 0, reasons: ['Project not found'] },
      };
    }
    fetchedProject = {
      ...p,
      partner: memoryPartners.find((ptn) => ptn.id === p.partner_id) || null,
    };
    fetchedMilestones = memoryMilestones.filter((m) => m.project_id === id);
    fetchedExpenses = memoryExpenses.filter((e) => e.project_id === id);
    fetchedUpdates = memoryUpdates.filter((u) => u.project_id === id);
    fetchedDocuments = memoryDocuments.filter((d) => d.project_id === id);
    fetchedReports = memoryReports.filter((r) => r.project_id === id);
  }

  const health = calculateProjectHealth(
    fetchedProject,
    fetchedMilestones,
    fetchedExpenses,
    fetchedUpdates,
    fetchedReports
  );

  return {
    project: fetchedProject,
    milestones: fetchedMilestones,
    expenses: fetchedExpenses,
    updates: fetchedUpdates,
    documents: fetchedDocuments,
    reports: fetchedReports,
    health,
  };
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const newId = `prj-${Date.now()}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id: newId,
    title: input.title,
    description: input.description || null,
    status: input.status,
    category: input.category,
    start_date: input.start_date,
    end_date: input.end_date || null,
    total_budget: Number(input.total_budget),
    spent_budget: 0,
    partner_id: input.partner_id || null,
    created_by: 'usr-1',
    created_at: now,
    updated_at: now,
    milestone_count: 0,
    completed_milestone_count: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('projects').insert({
        title: input.title,
        description: input.description || null,
        status: input.status,
        category: input.category,
        start_date: input.start_date,
        end_date: input.end_date || null,
        total_budget: input.total_budget,
        partner_id: input.partner_id || null,
      }).select().single();

      if (error) {
        console.error('[DataService] Supabase createProject error:', error);
      } else if (data) {
        return data as Project;
      }
    } catch (err) {
      console.warn('[DataService] Supabase createProject fallback:', err);
    }
  }

  memoryProjects.unshift(newProject);
  return newProject;
}

export async function getPartners(): Promise<Partner[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('partners').select('*').order('name', { ascending: true });
      if (!error && data) {
        return data as Partner[];
      }
    } catch (err) {
      console.warn('[DataService] Supabase getPartners fallback:', err);
    }
  }

  return memoryPartners.map((ptn) => ({
    ...ptn,
    project_count: memoryProjects.filter((p) => p.partner_id === ptn.id).length,
  }));
}

export async function createPartner(input: CreatePartnerInput): Promise<Partner> {
  const newId = `ptn-${Date.now()}`;
  const now = new Date().toISOString();

  const newPartner: Partner = {
    id: newId,
    name: input.name,
    type: input.type,
    contact_name: input.contact_name || null,
    contact_email: input.contact_email || null,
    contact_phone: input.contact_phone || null,
    website: input.website || null,
    description: input.description || null,
    created_at: now,
    updated_at: now,
    project_count: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('partners').insert({
        name: input.name,
        type: input.type,
        contact_name: input.contact_name,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        website: input.website,
        description: input.description,
      }).select().single();

      if (!error && data) {
        return data as Partner;
      }
    } catch (err) {
      console.warn('[DataService] Supabase createPartner fallback:', err);
    }
  }

  memoryPartners.unshift(newPartner);
  return newPartner;
}

export async function addMilestone(projectId: string, input: CreateMilestoneInput): Promise<Milestone> {
  const newId = `mls-${Date.now()}`;
  const now = new Date().toISOString();

  const newMilestone: Milestone = {
    id: newId,
    project_id: projectId,
    title: input.title,
    description: input.description || null,
    due_date: input.due_date,
    status: input.status,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('milestones').insert({
        project_id: projectId,
        title: input.title,
        description: input.description,
        due_date: input.due_date,
        status: input.status,
      }).select().single();

      if (!error && data) {
        return data as Milestone;
      }
    } catch (err) {
      console.warn('[DataService] Supabase addMilestone fallback:', err);
    }
  }

  memoryMilestones.push(newMilestone);

  // Update milestone count in project
  const prj = memoryProjects.find((p) => p.id === projectId);
  if (prj) {
    prj.milestone_count = (prj.milestone_count || 0) + 1;
    if (input.status === 'completed') {
      prj.completed_milestone_count = (prj.completed_milestone_count || 0) + 1;
    }
  }

  return newMilestone;
}

export async function addExpense(projectId: string, input: CreateExpenseInput): Promise<Expense> {
  const newId = `exp-${Date.now()}`;
  const now = new Date().toISOString();

  const newExpense: Expense = {
    id: newId,
    project_id: projectId,
    category: input.category,
    amount: Number(input.amount),
    description: input.description,
    date: input.date,
    receipt_url: null,
    created_by: 'usr-1',
    created_at: now,
    creator: { id: 'usr-1', display_name: 'Aman Verma', email: 'admin@csr360.org' },
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('expenses').insert({
        project_id: projectId,
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date,
      }).select().single();

      if (!error && data) {
        return data as Expense;
      }
    } catch (err) {
      console.warn('[DataService] Supabase addExpense fallback:', err);
    }
  }

  memoryExpenses.unshift(newExpense);

  // Update spent budget in project
  const prj = memoryProjects.find((p) => p.id === projectId);
  if (prj) {
    prj.spent_budget = (prj.spent_budget || 0) + Number(input.amount);
  }

  return newExpense;
}

export async function addProjectUpdate(projectId: string, input: CreateUpdateInput): Promise<ProjectUpdate> {
  const newId = `upd-${Date.now()}`;
  const now = new Date().toISOString();

  const newUpdate: ProjectUpdate = {
    id: newId,
    project_id: projectId,
    title: input.title,
    content: input.content,
    author_id: 'usr-1',
    created_at: now,
    author: { id: 'usr-1', display_name: 'Aman Verma', email: 'admin@csr360.org' },
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('project_updates').insert({
        project_id: projectId,
        title: input.title,
        content: input.content,
      }).select().single();

      if (!error && data) {
        return data as ProjectUpdate;
      }
    } catch (err) {
      console.warn('[DataService] Supabase addProjectUpdate fallback:', err);
    }
  }

  memoryUpdates.unshift(newUpdate);
  return newUpdate;
}

export async function getReports(projectId?: string): Promise<ProjectReport[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      let query = supabase.from('reports').select('*, project:projects(title)').order('created_at', { ascending: false });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as ProjectReport[];
      }
    } catch (err) {
      console.warn('[DataService] Supabase getReports fallback:', err);
    }
  }

  let res = [...memoryReports];
  if (projectId) {
    res = res.filter((r) => r.project_id === projectId);
  }
  return res.map((r) => ({
    ...r,
    project: memoryProjects.find((p) => p.id === r.project_id) || null,
  }));
}

export async function getReportById(id: string): Promise<ProjectReport | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('reports').select('*, project:projects(*)').eq('id', id).single();
      if (!error && data) {
        return data as ProjectReport;
      }
    } catch (err) {
      console.warn('[DataService] Supabase getReportById fallback:', err);
    }
  }

  const rep = memoryReports.find((r) => r.id === id) || null;
  if (!rep) return null;
  return {
    ...rep,
    project: memoryProjects.find((p) => p.id === rep.project_id) || null,
  };
}

export async function addReport(projectId: string, input: CreateReportInput): Promise<ProjectReport> {
  const newId = `rep-${Date.now()}`;
  const now = new Date().toISOString();

  const newReport: ProjectReport = {
    id: newId,
    project_id: projectId,
    title: input.title,
    file_url: input.file_url,
    file_type: input.file_type || 'application/pdf',
    file_size: Number(input.file_size) || 1024000,
    submitted_by: 'usr-1',
    created_at: now,
    summary_json: null,
    submitter: { id: 'usr-1', display_name: 'Aman Verma', email: 'admin@csr360.org' },
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('reports').insert({
        project_id: projectId,
        title: input.title,
        file_url: input.file_url,
        file_type: input.file_type,
        file_size: input.file_size,
      }).select().single();

      if (!error && data) {
        return data as ProjectReport;
      }
    } catch (err) {
      console.warn('[DataService] Supabase addReport fallback:', err);
    }
  }

  memoryReports.unshift(newReport);
  return newReport;
}

export async function saveReportSummary(reportId: string, summary: ReportSummary): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      await supabase.from('reports').update({ summary_json: summary }).eq('id', reportId);
    } catch (err) {
      console.warn('[DataService] Supabase saveReportSummary fallback:', err);
    }
  }

  const rep = memoryReports.find((r) => r.id === reportId);
  if (rep) {
    rep.summary_json = summary;
  }
  return true;
}

export async function getDocuments(projectId?: string): Promise<Document[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Document[];
      }
    } catch (err) {
      console.warn('[DataService] Supabase getDocuments fallback:', err);
    }
  }

  let res = [...memoryDocuments];
  if (projectId) {
    res = res.filter((d) => d.project_id === projectId);
  }
  return res;
}

export async function addDocument(projectId: string, input: { name: string; file_url: string; file_type: string; file_size: number }): Promise<Document> {
  const newId = `doc-${Date.now()}`;
  const now = new Date().toISOString();

  const newDoc: Document = {
    id: newId,
    project_id: projectId,
    name: input.name,
    file_url: input.file_url,
    file_type: input.file_type,
    file_size: Number(input.file_size),
    uploaded_by: 'usr-1',
    created_at: now,
    uploader: { id: 'usr-1', display_name: 'Aman Verma', email: 'admin@csr360.org' },
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('documents').insert({
        project_id: projectId,
        name: input.name,
        file_url: input.file_url,
        file_type: input.file_type,
        file_size: input.file_size,
      }).select().single();

      if (!error && data) {
        return data as Document;
      }
    } catch (err) {
      console.warn('[DataService] Supabase addDocument fallback:', err);
    }
  }

  memoryDocuments.unshift(newDoc);
  return newDoc;
}

export async function deleteDocument(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      await supabase.from('documents').delete().eq('id', id);
    } catch (err) {
      console.warn('[DataService] Supabase deleteDocument fallback:', err);
    }
  }

  memoryDocuments = memoryDocuments.filter((d) => d.id !== id);
  return true;
}

export async function globalSearch(query: string): Promise<{
  projects: Array<{ id: string; title: string; subtitle: string; url: string }>;
  documents: Array<{ id: string; title: string; subtitle: string; url: string }>;
  reports: Array<{ id: string; title: string; subtitle: string; url: string }>;
  milestones: Array<{ id: string; title: string; subtitle: string; url: string }>;
  partners: Array<{ id: string; title: string; subtitle: string; url: string }>;
}> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { projects: [], documents: [], reports: [], milestones: [], partners: [] };
  }

  const projects = memoryProjects
    .filter((p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
    .map((p) => ({ id: p.id, title: p.title, subtitle: `${p.category} • ${p.status.replace('_', ' ')}`, url: `/projects/${p.id}` }));

  const documents = memoryDocuments
    .filter((d) => d.name.toLowerCase().includes(q))
    .map((d) => ({ id: d.id, title: d.name, subtitle: `Document • ${d.file_type}`, url: `/documents` }));

  const reports = memoryReports
    .filter((r) => r.title.toLowerCase().includes(q))
    .map((r) => ({ id: r.id, title: r.title, subtitle: `Compliance & Progress Report`, url: `/reports` }));

  const milestones = memoryMilestones
    .filter((m) => m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q)))
    .map((m) => ({ id: m.id, title: m.title, subtitle: `Milestone • ${m.status}`, url: `/projects/${m.project_id}` }));

  const partners = memoryPartners
    .filter((ptn) => ptn.name.toLowerCase().includes(q) || (ptn.description && ptn.description.toLowerCase().includes(q)))
    .map((ptn) => ({ id: ptn.id, title: ptn.name, subtitle: `Partner (${ptn.type.toUpperCase()})`, url: `/partners` }));

  return { projects, documents, reports, milestones, partners };
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return memoryActivityLog;
}

export async function getAIInsights(): Promise<AIInsight[]> {
  return memoryInsights;
}

export async function seedDemoData(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      for (const partner of mockPartners) {
        await supabase.from('partners').upsert({
          id: partner.id,
          name: partner.name,
          type: partner.type,
          contact_name: partner.contact_name,
          contact_email: partner.contact_email,
          contact_phone: partner.contact_phone,
          website: partner.website,
          description: partner.description,
        });
      }
      for (const project of mockProjects) {
        await supabase.from('projects').upsert({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          category: project.category,
          start_date: project.start_date,
          end_date: project.end_date,
          total_budget: project.total_budget,
          partner_id: project.partner_id,
        });
      }
      for (const rep of mockReports) {
        await supabase.from('reports').upsert({
          id: rep.id,
          project_id: rep.project_id,
          title: rep.title,
          file_url: rep.file_url,
          file_type: rep.file_type,
          file_size: rep.file_size,
          summary_json: rep.summary_json,
        });
      }
      return true;
    } catch (err) {
      console.error('[DataService] Seed error:', err);
    }
  }

  memoryProjects = [...mockProjects];
  memoryPartners = [...mockPartners];
  memoryMilestones = [...mockMilestones];
  memoryExpenses = [...mockExpenses];
  memoryUpdates = [...mockProjectUpdates];
  memoryDocuments = [...mockDocuments];
  memoryReports = [...mockReports];
  return true;
}
