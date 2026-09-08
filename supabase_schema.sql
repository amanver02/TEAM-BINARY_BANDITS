-- ==============================================================================
-- CSR Flow — Complete Supabase Database Migration & Schema Script
-- Copy & Paste this entire script into your Supabase Dashboard:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create Partners Table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'ngo',
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    category TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    spent_budget NUMERIC(15, 2) DEFAULT 0,
    location TEXT,
    beneficiaries TEXT,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    created_by TEXT DEFAULT 'usr-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    receipt_url TEXT,
    created_by TEXT DEFAULT 'usr-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Project Updates Table
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT DEFAULT 'usr-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    uploaded_by TEXT DEFAULT 'usr-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'application/pdf',
    file_size BIGINT NOT NULL DEFAULT 0,
    submitted_by TEXT DEFAULT 'usr-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    summary_json JSONB
);

-- ==============================================================================
-- Row Level Security (RLS) Policies — Grants Access for Anonymous & Authenticated Users
-- ==============================================================================

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Partners Policies
CREATE POLICY "Allow public read partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Allow public write partners" ON public.partners FOR ALL USING (true);

-- Projects Policies
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public write projects" ON public.projects FOR ALL USING (true);

-- Milestones Policies
CREATE POLICY "Allow public read milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Allow public write milestones" ON public.milestones FOR ALL USING (true);

-- Expenses Policies
CREATE POLICY "Allow public read expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public write expenses" ON public.expenses FOR ALL USING (true);

-- Project Updates Policies
CREATE POLICY "Allow public read updates" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Allow public write updates" ON public.project_updates FOR ALL USING (true);

-- Documents Policies
CREATE POLICY "Allow public read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public write documents" ON public.documents FOR ALL USING (true);

-- Reports Policies
CREATE POLICY "Allow public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public write reports" ON public.reports FOR ALL USING (true);

-- ==============================================================================
-- Initial Demo Seed Data
-- ==============================================================================

INSERT INTO public.partners (id, name, type, contact_name, contact_email, contact_phone, website, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sanjeevani Education Foundation', 'ngo', 'Dr. Sunita Deshmukh', 'sunita@sanjeevani.org', '+91 98765 43210', 'https://sanjeevani.org', 'Empowering rural youth through digital literacy and skill development.'),
  ('22222222-2222-2222-2222-222222222222', 'Arogya Healthcare Trust', 'trust', 'Rajesh Sharma', 'contact@arogyahealth.org', '+91 98123 45678', 'https://arogyahealth.org', 'Providing mobile medical units in underserved districts.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, title, description, status, category, start_date, end_date, total_budget, spent_budget, partner_id)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Digital Literacy Centers in Rural Primary Schools', 'Setting up 25 solar-powered computer labs in primary schools across Latur district.', 'active', 'Education', '2026-01-15', '2026-10-31', 4500000, 2850000, '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', 'Mobile Primary Health Clinic Units', 'Deploying 3 fully equipped mobile health vans with tele-consultation facilities.', 'active', 'Healthcare', '2026-02-01', '2026-12-15', 7500000, 4200000, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;
