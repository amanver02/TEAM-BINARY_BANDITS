import { NextResponse } from 'next/server';
import { addProjectUpdate } from '@/lib/data-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const update = await addProjectUpdate(id, body);
    return NextResponse.json({ data: update, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post update';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
