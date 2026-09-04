'use client';

import { useEffect, useState } from 'react';
import { FileText, Search, Trash2 } from 'lucide-react';
import { Document } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (json.data) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Document Vault</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized document management for proposals, contracts, invoices, and evidence.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="card p-6">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading document vault...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No documents found matching &quot;{search}&quot;.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col justify-between space-y-3 hover:border-indigo-200 transition-colors shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{doc.file_type.split('/')[1] || 'PDF'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
