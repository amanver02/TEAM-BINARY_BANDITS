import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/data-service';
import { callGeminiJSON } from '@/lib/gemini/client';
import { AskAIResponse, AIEvidence } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ data: null, error: 'Question is required' }, { status: 400 });
    }

    const { project, milestones, expenses, updates, documents, reports, health } = await getProjectById(id);

    if (!project) {
      return NextResponse.json({
        data: {
          answer: "I couldn't find enough information in this project's records.",
          evidence: [],
          is_missing_data: true,
          generated_at: new Date().toISOString(),
        },
        error: null,
      });
    }

    const totalBudget = Number(project.total_budget) || 0;
    const spentBudget = Number(project.spent_budget) || expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const completedMilestones = milestones.filter((m) => m.status === 'completed');
    const overdueMilestones = milestones.filter((m) => m.status === 'overdue');

    // Ground-truth context payload for Gemini
    const projectContext = `
PROJECT RECORD:
- Title: ${project.title}
- ID: ${project.id}
- Category: ${project.category}
- Status: ${project.status}
- Location: ${project.location || 'India'}
- Beneficiaries: ${project.beneficiaries || 'Community members'}
- Total Budget: ₹${totalBudget.toLocaleString('en-IN')}
- Spent Budget: ₹${spentBudget.toLocaleString('en-IN')}
- Remaining Budget: ₹${(totalBudget - spentBudget).toLocaleString('en-IN')}
- Partner: ${project.partner ? project.partner.name : 'N/A'}
- Health Status: ${health.status} (Score: ${health.score}/100)
- Health Reasons: ${health.reasons.join('; ')}

MILESTONES (${milestones.length} total, ${completedMilestones.length} completed, ${overdueMilestones.length} overdue):
${milestones.map((m) => `- [${m.status.toUpperCase()}] ${m.title} (Due: ${m.due_date})`).join('\n')}

RECENT EXPENSES (${expenses.length}):
${expenses.slice(0, 5).map((e) => `- ₹${Number(e.amount).toLocaleString('en-IN')} for ${e.description} (${e.category}, Date: ${e.date})`).join('\n')}

PROJECT UPDATES (${updates.length}):
${updates.map((u) => `- [${u.created_at.slice(0, 10)}] ${u.title}: ${u.content}`).join('\n')}

DOCUMENTS (${documents.length}):
${documents.map((d) => `- ${d.name} (${d.file_type}, Uploaded: ${d.created_at.slice(0, 10)})`).join('\n')}

REPORTS (${reports.length}):
${reports.map((r) => `- ${r.title} (Submitted: ${r.created_at.slice(0, 10)})`).join('\n')}
`;

    const prompt = `
You are CSR Flow AI, an enterprise assistant for Corporate Social Responsibility auditing.
Answer the user's question using ONLY the provided Project Record context below.

CRITICAL INSTRUCTIONS:
1. Base your answer strictly on the provided records. Never hallucinate facts, figures, or external details.
2. If the project context does NOT contain sufficient data to answer the user's specific question, set "is_missing_data" to true and return "answer": "I couldn't find enough information in this project's records."
3. Provide supporting "evidence" items extracted from the records. Each evidence item MUST include:
   - "entity_type": one of ("budget", "expense", "milestone", "report", "project_update", "document", "project")
   - "title": concise name of the record item
   - "snippet": short text or metric excerpt
   - "target_tab": one of ("overview", "financials", "milestones", "documents", "reports", "updates")

JSON Schema:
{
  "answer": "Concise factual answer...",
  "evidence": [
    {
      "entity_type": "milestone",
      "title": "Hardware Delivery",
      "snippet": "Overdue milestone due Mar 10",
      "target_tab": "milestones"
    }
  ],
  "is_missing_data": false
}

User Question: "${question}"

Project Data:
${projectContext}
`;

    let aiResult: AskAIResponse | null = null;
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini')) {
      aiResult = await callGeminiJSON<AskAIResponse>(prompt);
    }

    if (!aiResult || !aiResult.answer) {
      const qLower = question.toLowerCase();
      let answer = `For project "${project.title}", total budget is ₹${(totalBudget / 100000).toFixed(1)}L with ₹${(spentBudget / 100000).toFixed(1)}L spent. Current health status is ${health.status}.`;
      const evidence: AIEvidence[] = [
        {
          entity_type: 'budget',
          title: 'Project Financials',
          snippet: `₹${(spentBudget / 100000).toFixed(1)}L spent out of ₹${(totalBudget / 100000).toFixed(1)}L total budget`,
          target_tab: 'financials',
        },
      ];

      if (qLower.includes('milestone') || qLower.includes('overdue')) {
        if (overdueMilestones.length > 0) {
          answer = `Project "${project.title}" has ${overdueMilestones.length} overdue milestone(s): ${overdueMilestones.map((m) => m.title).join(', ')}.`;
          evidence.push({
            entity_type: 'milestone',
            title: overdueMilestones[0].title,
            snippet: `Status: Overdue (Due ${overdueMilestones[0].due_date})`,
            target_tab: 'milestones',
          });
        } else {
          answer = `All ${completedMilestones.length} completed milestones for "${project.title}" are on track without overdue items.`;
          evidence.push({
            entity_type: 'milestone',
            title: 'Milestone Status',
            snippet: `${completedMilestones.length} of ${milestones.length} milestones completed`,
            target_tab: 'milestones',
          });
        }
      } else if (qLower.includes('budget') || qLower.includes('spent') || qLower.includes('remain')) {
        const remaining = totalBudget - spentBudget;
        answer = `Total budget is ₹${(totalBudget / 100000).toFixed(1)}L, with ₹${(spentBudget / 100000).toFixed(1)}L spent and ₹${(remaining / 100000).toFixed(1)}L remaining.`;
        if (expenses.length > 0) {
          evidence.push({
            entity_type: 'expense',
            title: expenses[0].category,
            snippet: `₹${Number(expenses[0].amount).toLocaleString('en-IN')} - ${expenses[0].description}`,
            target_tab: 'financials',
          });
        }
      } else if (qLower.includes('status') || qLower.includes('health') || qLower.includes('why')) {
        answer = `Project status is "${project.status}" and health rating is "${health.status}" (Score ${health.score}/100). Key reason: ${health.reasons[0] || 'Progress matches planned schedule'}.`;
        evidence.push({
          entity_type: 'project',
          title: 'Health Evaluation',
          snippet: health.reasons[0] || 'On schedule',
          target_tab: 'overview',
        });
      }

      aiResult = {
        answer,
        evidence,
        is_missing_data: false,
        generated_at: new Date().toISOString(),
      };
    } else {
      aiResult.generated_at = new Date().toISOString();
    }

    return NextResponse.json({ data: aiResult, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI query failed';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
