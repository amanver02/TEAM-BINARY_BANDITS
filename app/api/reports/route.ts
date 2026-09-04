import { NextResponse } from 'next/server';
import { getProjects, getPartners, getDashboardStats, getReports, addReport } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const list = searchParams.get('list');
    const projectId = searchParams.get('projectId') || undefined;

    if (list === 'true' || projectId) {
      const reports = await getReports(projectId);
      return NextResponse.json({ data: reports, error: null });
    }

    const stats = await getDashboardStats();
    const projects = await getProjects();
    const partners = await getPartners();

    // Grouping calculations
    const categoryTotals: Record<string, { allocated: number; spent: number; count: number }> = {};

    projects.forEach((p) => {
      if (!categoryTotals[p.category]) {
        categoryTotals[p.category] = { allocated: 0, spent: 0, count: 0 };
      }
      categoryTotals[p.category].allocated += Number(p.total_budget || 0);
      categoryTotals[p.category].spent += Number(p.spent_budget || 0);
      categoryTotals[p.category].count += 1;
    });

    const partnerTotals: Record<string, { name: string; projectCount: number; totalBudget: number }> = {};
    partners.forEach((ptn) => {
      const ptnProjects = projects.filter((p) => p.partner_id === ptn.id);
      const totalBudget = ptnProjects.reduce((sum, p) => sum + Number(p.total_budget || 0), 0);
      partnerTotals[ptn.id] = {
        name: ptn.name,
        projectCount: ptnProjects.length,
        totalBudget,
      };
    });

    return NextResponse.json({
      data: {
        stats,
        categoryTotals,
        partnerTotals,
        projectCount: projects.length,
        partnerCount: partners.length,
      },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate report metrics';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, title, file_url, file_type, file_size } = body;

    if (!projectId || !title) {
      return NextResponse.json({ data: null, error: 'Project ID and title are required' }, { status: 400 });
    }

    const report = await addReport(projectId, {
      title,
      file_url: file_url || '#',
      file_type: file_type || 'application/pdf',
      file_size: Number(file_size) || 1024000,
    });

    return NextResponse.json({ data: report, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create report';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
