import { NextResponse } from 'next/server';
import { getDocuments, addDocument, deleteDocument } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;
    const documents = await getDocuments(projectId);
    return NextResponse.json({ data: documents, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch documents';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, name, file_url, file_type, file_size } = body;

    if (!projectId || !name) {
      return NextResponse.json({ data: null, error: 'Project ID and document name required' }, { status: 400 });
    }

    const doc = await addDocument(projectId, {
      name,
      file_url: file_url || '#',
      file_type: file_type || 'application/pdf',
      file_size: Number(file_size) || 1024000,
    });

    return NextResponse.json({ data: doc, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload document';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ data: null, error: 'Document ID is required' }, { status: 400 });
    }

    await deleteDocument(id);
    return NextResponse.json({ data: true, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete document';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
