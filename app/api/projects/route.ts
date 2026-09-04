import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('query') || undefined;

    const projects = await getProjects({ status, category, query });
    return NextResponse.json({ data: projects, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = await createProject(body);
    return NextResponse.json({ data: newProject, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
