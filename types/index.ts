// ─── Enums ───────────────────────────────────────────────────────────────────

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type PartnerType = 'ngo' | 'government' | 'corporate' | 'community';
export type UserRole = 'admin' | 'member';
export type InsightSeverity = 'risk' | 'warning' | 'info' | 'positive';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  // joined
  project_count?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  category: string;
  start_date: string;
  end_date: string | null;
  total_budget: number;
  spent_budget?: number;
  location?: string | null;
  beneficiaries?: string | null;
  partner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // joined
  partner?: Partner | null;
  milestone_count?: number;
  completed_milestone_count?: number;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  project_id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
  created_by: string;
  created_at: string;
  // joined
  creator?: Pick<User, 'id' | 'display_name' | 'email'>;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  // joined
  uploader?: Pick<User, 'id' | 'display_name' | 'email'>;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  // joined
  author?: Pick<User, 'id' | 'display_name' | 'email'>;
}

export interface ActivityLog {
  id: string;
  project_id: string | null;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // joined
  user?: Pick<User, 'id' | 'display_name' | 'email'>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_budget: number;
  total_spent: number;
  projects_by_status: Record<ProjectStatus, number>;
}

// ─── AI Insights ─────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  severity: InsightSeverity;
  data_points: string[];
  project_ids?: string[];
  generated_at: string;
}

export interface ProjectAISummary {
  summary: string;
  risks: string[];
  recommendations: string[];
  generated_at: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
}

export type DocumentCategory = 'Proposal' | 'Agreement' | 'Report' | 'Invoice' | 'Evidence' | 'Other';
export type HealthStatus = 'Healthy' | 'Good' | 'Needs Attention' | 'At Risk';

export interface ReportSummary {
  key_achievements: string[];
  important_issues: string[];
  financial_highlights: string[];
  next_actions: string[];
  generated_at: string;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  submitted_by: string;
  created_at: string;
  summary_json?: ReportSummary | null;
  // joined
  project?: Project | null;
  submitter?: Pick<User, 'id' | 'display_name' | 'email'>;
}

export interface AIEvidence {
  entity_type: 'budget' | 'expense' | 'milestone' | 'report' | 'project_update' | 'document' | 'project';
  entity_id?: string;
  title: string;
  snippet: string;
  target_tab: 'overview' | 'financials' | 'milestones' | 'documents' | 'reports' | 'updates';
}

export interface AskAIResponse {
  answer: string;
  evidence: AIEvidence[];
  is_missing_data: boolean;
  generated_at: string;
}

export interface ProjectHealth {
  status: HealthStatus;
  score: number; // 0 - 100
  reasons: string[];
}

export interface CreateReportInput {
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  status: ProjectStatus;
  category: string;
  start_date: string;
  end_date?: string;
  total_budget: number;
  partner_id?: string;
}

export interface CreatePartnerInput {
  name: string;
  type: PartnerType;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  due_date: string;
  status: MilestoneStatus;
}

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface CreateUpdateInput {
  title: string;
  content: string;
}

