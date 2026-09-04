import { NextResponse } from 'next/server';
import { addMilestone } from '@/lib/data-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const milestone = await addMilestone(id, body);
    return NextResponse.json({ data: milestone, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add milestone';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
