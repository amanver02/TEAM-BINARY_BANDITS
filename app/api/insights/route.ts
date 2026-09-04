import { NextResponse } from 'next/server';
import { getAIInsights, getProjects } from '@/lib/data-service';
import { callGeminiJSON } from '@/lib/gemini/client';
import { AIInsight } from '@/types';

export async function GET() {
  try {
    const insights = await getAIInsights();
    return NextResponse.json({ data: insights, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch insights';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const projects = await getProjects();
    const mockInsights = await getAIInsights();

    const prompt = `
You are an executive CSR Strategy and ESG Risk AI Agent. Analyze the organization's portfolio of ${projects.length} CSR projects and output a JSON array of insights. Each insight must match:
{
  "id": "ins-gen-1",
  "title": "Short title",
  "summary": "Detailed summary describing risk, efficiency, or compliance alert",
  "severity": "risk" | "warning" | "info" | "positive",
  "data_points": ["Data point 1", "Data point 2"]
}

Current Projects: ${JSON.stringify(projects.map((p) => ({ id: p.id, title: p.title, status: p.status, budget: p.total_budget, spent: p.spent_budget, category: p.category })))}
`;

    let generated: AIInsight[] | null = null;
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini')) {
      generated = await callGeminiJSON<AIInsight[]>(prompt);
    }

    const insights = generated || mockInsights;
    return NextResponse.json({ data: insights, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to run AI insights audit';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
