import { NextResponse } from 'next/server';
import { getPartners, createPartner } from '@/lib/data-service';

export async function GET() {
  try {
    const partners = await getPartners();
    return NextResponse.json({ data: partners, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch partners';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPartner = await createPartner(body);
    return NextResponse.json({ data: newPartner, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create partner';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
