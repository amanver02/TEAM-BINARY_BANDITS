import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/data-service';
import { callGeminiJSON } from '@/lib/gemini/client';
import { ProjectAISummary } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { project, milestones, expenses, updates } = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ data: null, error: 'Project not found' }, { status: 404 });
    }

    const spent = project.spent_budget || 0;
    const total = project.total_budget || 1;
    const spendPct = Math.round((spent / total) * 100);

    const overdueMilestones = milestones.filter((m) => m.status === 'overdue').length;
    const completedMilestones = milestones.filter((m) => m.status === 'completed').length;

    // Prompt for Gemini
    const prompt = `
You are an expert CSR (Corporate Social Responsibility) & ESG auditor. Analyze the following project data and return a JSON object strictly matching this schema:
{
  "summary": "2-3 sentence overview of project progress and budget utilization",
  "risks": ["Risk point 1", "Risk point 2"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]
}

Project Details:
- Title: ${project.title}
- Category: ${project.category}
- Status: ${project.status}
- Total Budget: ₹${project.total_budget}
- Spent Budget: ₹${spent} (${spendPct}% spent)
- Partner: ${project.partner ? project.partner.name : 'None'}
- Milestones (${milestones.length} total, ${completedMilestones} completed, ${overdueMilestones} overdue)
- Milestone list: ${JSON.stringify(milestones.map((m) => ({ title: m.title, status: m.status, due: m.due_date })))}
- Recent Expenses (${expenses.length}): ${JSON.stringify(expenses.slice(0, 3).map((e) => ({ category: e.category, amount: e.amount })))}
- Recent Updates count: ${updates.length}
`;

    let aiResult: ProjectAISummary | null = null;

    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini')) {
      aiResult = await callGeminiJSON<ProjectAISummary>(prompt);
    }

    // Fallback if Gemini API is unconfigured or failed
    if (!aiResult) {
      aiResult = {
        summary: `Project "${project.title}" is currently in ${project.status} status with ${spendPct}% of the ₹${(total / 100000).toFixed(1)}L allocated budget utilized across ${completedMilestones} completed milestones.`,
        risks: [
          overdueMilestones > 0
            ? `Contains ${overdueMilestones} overdue milestone(s) requiring immediate partner coordination.`
            : `Monitor milestone target dates closely as project progresses towards mid-term goals.`,
          spendPct > 75
            ? `High budget consumption (${spendPct}%) relative to total timeline remaining.`
            : `Ensure expense receipts and vendor audit documents are continuously verified.`,
        ],
        recommendations: [
          `Schedule bi-weekly status sync with implementing partner ${project.partner?.name || ''}.`,
          `Upload all vendor agreements and procurement invoices to the project document vault.`,
          `Review expenditure allocation against CSR Schedule VII compliance benchmarks.`,
        ],
        generated_at: new Date().toISOString(),
      };
    } else {
      aiResult.generated_at = new Date().toISOString();
    }

    return NextResponse.json({ data: aiResult, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI analysis failed';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
