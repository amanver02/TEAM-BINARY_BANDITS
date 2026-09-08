'use client';

import { useState } from 'react';
import { Settings, Database, Sparkles, User, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.data?.seeded) {
        setSeedMessage('Demo dataset successfully seeded/reset!');
      } else {
        setSeedMessage('Data refreshed in fallback memory mode.');
      }
    } catch (err) {
      setSeedMessage('Error seeding demo data.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight"> shahbaz Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User profile, integration status, and demo dataset manager
        </p>
      </div>

      {/* User Profile Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">User Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-semibold">User Email</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.email || 'admin@csr360.org'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold">Role & Access</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">CSR Administrator</p>
          </div>
        </div>
      </div>

      {/* System Integration Status */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Integrations & Architecture Status</h2>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Database size={16} className="text-emerald-600" />
              <div>
                <p className="font-bold text-slate-800">Supabase PostgreSQL Database</p>
                <p className="text-slate-500">Row Level Security & Service Role Backend</p>
              </div>
            </div>
            <span className="badge badge-green">Ready / Active</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-amber-500" />
              <div>
                <p className="font-bold text-slate-800">Google Gemini 1.5 Flash API</p>
                <p className="text-slate-500">Autonomous Risk Auditing & Recommendation Generator</p>
              </div>
            </div>
            <span className="badge badge-blue">Model Connected</span>
          </div>
        </div>
      </div>

      {/* Seed Demo Data Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">Demo Data Utility</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Populate or reset the workspace with 6 realistic CSR projects, partners, milestones, and expense ledgers for demonstration purposes.
        </p>

        {seedMessage && (
          <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-md text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{seedMessage}</span>
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
          <span>{seeding ? 'Seeding Data...' : 'Seed Sample CSR Dataset'}</span>
        </button>
      </div>
    </div>
  );
}
