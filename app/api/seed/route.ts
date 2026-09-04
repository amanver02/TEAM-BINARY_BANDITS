import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/data-service';

export async function POST() {
  try {
    const success = await seedDemoData();
    return NextResponse.json({ data: { seeded: success }, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to seed demo data';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
