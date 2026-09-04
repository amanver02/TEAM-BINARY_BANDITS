-- ============================================================
-- CSR Flow — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default uuid_generate_v4(),
  firebase_uid  text unique not null,
  email         text unique not null,
  display_name  text,
  avatar_url    text,
  role          text not null default 'member' check (role in ('admin', 'member')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── PARTNERS ─────────────────────────────────────────────────────────────────
create table if not exists partners (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  type           text not null check (type in ('ngo', 'government', 'corporate', 'community')),
  contact_name   text,
  contact_email  text,
  contact_phone  text,
  website        text,
  description    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── PROJECTS ─────────────────────────────────────────────────────────────────
create table if not exists projects (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  status        text not null default 'planning'
                  check (status in ('planning', 'active', 'on_hold', 'completed')),
  category      text not null,
  start_date    date not null,
  end_date      date,
  total_budget  numeric(15, 2) not null default 0,
  partner_id    uuid references partners(id) on delete set null,
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── MILESTONES ───────────────────────────────────────────────────────────────
create table if not exists milestones (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  description text,
  due_date    date not null,
  status      text not null default 'pending'
                check (status in ('pending', 'in_progress', 'completed', 'overdue')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── EXPENSES ─────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  category    text not null,
  amount      numeric(15, 2) not null,
  description text not null,
  date        date not null,
  receipt_url text,
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── DOCUMENTS ────────────────────────────────────────────────────────────────
create table if not exists documents (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects(id) on delete cascade,
  name         text not null,
  file_url     text not null,
  file_type    text not null,
  file_size    bigint not null,
  uploaded_by  uuid references users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── PROJECT UPDATES ──────────────────────────────────────────────────────────
create table if not exists project_updates (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  content     text not null,
  author_id   uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── REPORTS ──────────────────────────────────────────────────────────────────
create table if not exists reports (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  file_url     text not null,
  file_type    text not null default 'pdf',
  file_size    bigint not null default 0,
  submitted_by uuid references users(id) on delete set null,
  summary_json jsonb,
  created_at   timestamptz not null default now()
);

-- ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
create table if not exists ai_insights (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid references projects(id) on delete cascade,
  title        text not null,
  summary      text not null,
  severity     text not null check (severity in ('risk', 'warning', 'info', 'positive')),
  data_points  jsonb not null default '[]',
  created_at   timestamptz not null default now()
);

-- ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
create table if not exists activity_log (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid references projects(id) on delete cascade,
  user_id      uuid references users(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  metadata     jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index if not exists idx_projects_status      on projects(status);
create index if not exists idx_projects_partner     on projects(partner_id);
create index if not exists idx_projects_created_by  on projects(created_by);
create index if not exists idx_milestones_project   on milestones(project_id);
create index if not exists idx_milestones_status    on milestones(status);
create index if not exists idx_expenses_project     on expenses(project_id);
create index if not exists idx_documents_project    on documents(project_id);
create index if not exists idx_updates_project      on project_updates(project_id);
create index if not exists idx_activity_project     on activity_log(project_id);
create index if not exists idx_activity_user        on activity_log(user_id);
create index if not exists idx_activity_created     on activity_log(created_at desc);

-- ─── FUNCTIONS ────────────────────────────────────────────────────────────────

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create or replace trigger trg_projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create or replace trigger trg_partners_updated_at
  before update on partners
  for each row execute function update_updated_at();

create or replace trigger trg_milestones_updated_at
  before update on milestones
  for each row execute function update_updated_at();

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
alter table users           enable row level security;
alter table partners        enable row level security;
alter table projects        enable row level security;
alter table milestones      enable row level security;
alter table expenses        enable row level security;
alter table documents       enable row level security;
alter table project_updates enable row level security;
alter table activity_log    enable row level security;

-- For now: authenticated users can read all; service role handles writes via API
-- These policies are intentionally permissive for a single-org app.
-- Tighten per-row if multi-tenancy is added later.

create policy "Users can view all data"
  on users for select using (true);

create policy "Anyone authenticated can view partners"
  on partners for select using (true);

create policy "Anyone authenticated can view projects"
  on projects for select using (true);

create policy "Anyone authenticated can view milestones"
  on milestones for select using (true);

create policy "Anyone authenticated can view expenses"
  on expenses for select using (true);

create policy "Anyone authenticated can view documents"
  on documents for select using (true);

create policy "Anyone authenticated can view updates"
  on project_updates for select using (true);

create policy "Anyone authenticated can view activity"
  on activity_log for select using (true);

-- ─── STORAGE BUCKET ───────────────────────────────────────────────────────────
-- Run separately in Supabase Storage dashboard or via API:
-- Create a bucket named "csr360-documents" with private access.
-- File uploads go through the service role (server-side only).
