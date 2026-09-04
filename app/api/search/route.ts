import { NextResponse } from 'next/server';
import { globalSearch } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const results = await globalSearch(q);
    return NextResponse.json({ data: results, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
