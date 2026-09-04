import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/data-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await getProjectById(id);

    if (!data.project) {
      return NextResponse.json({ data: null, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ data, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch project details';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
