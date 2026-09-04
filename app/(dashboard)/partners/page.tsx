'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, ExternalLink, Mail, Phone, Building2, Globe } from 'lucide-react';
import { Partner, PartnerType } from '@/types';
import { PARTNER_TYPE_BADGE, PARTNER_TYPE_LABELS } from '@/lib/utils';
import CreatePartnerModal from '@/components/partners/CreatePartnerModal';

const PARTNER_TYPE_TABS: Array<{ label: string; value: string }> = [
  { label: 'All Partners', value: 'all' },
  { label: 'NGOs', value: 'ngo' },
  { label: 'Government Agencies', value: 'government' },
  { label: 'Corporate Partners', value: 'corporate' },
  { label: 'Community Groups', value: 'community' },
];

export default function PartnersDirectoryPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      setPartners(data.data || []);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((p) => {
    if (activeTab === 'all') return true;
    return p.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Implementing Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-profit NGOs, government bodies, and corporate partners delivering CSR projects
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0"
        >
          <Plus size={15} />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-1">
          {PARTNER_TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="card p-12 text-center text-xs text-slate-400">Loading partners...</div>
      ) : filteredPartners.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <Users size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No partners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`badge ${PARTNER_TYPE_BADGE[partner.type]}`}>
                    {PARTNER_TYPE_LABELS[partner.type]}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {partner.project_count || 0} active project(s)
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{partner.name}</h3>
                  {partner.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                      {partner.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                {partner.contact_name && (
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span>{partner.contact_name}</span>
                  </div>
                )}
                {partner.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${partner.contact_email}`} className="hover:underline text-brand-600">
                      {partner.contact_email}
                    </a>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center gap-2 pt-1">
                    <Globe size={14} className="text-slate-400 shrink-0" />
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-brand-600 font-medium inline-flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreatePartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPartners}
      />
    </div>
  );
}
