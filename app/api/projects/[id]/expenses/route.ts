import { NextResponse } from 'next/server';
import { addExpense } from '@/lib/data-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const expense = await addExpense(id, body);
    return NextResponse.json({ data: expense, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to log expense';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
