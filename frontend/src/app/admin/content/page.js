'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const TABS = [
  { key: 'about', label: 'About Us' },
  { key: 'contact', label: 'Contact Info' },
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'cancellation_refund', label: 'Cancellation & Refund' },
];

export default function AdminContent() {
  const [tab, setTab] = useState('about');
  const [content, setContent] = useState({});
  const [msg, setMsg] = useState('');

  function load(key) {
    setMsg('');
    api.get(`/site-content/${key}`).then((d) => setContent(d.content?.content || {})).catch(() => setContent({}));
  }
  useEffect(() => load(tab), [tab]);

  async function save() {
    try {
      await api.put(`/site-content/${tab}`, { content }, { auth: true });
      setMsg('Saved successfully.');
    } catch (err) { setMsg(err.message); }
  }

  function updateField(key, value) { setContent({ ...content, [key]: value }); }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Website Content Management</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-sm ${tab === t.key ? 'bg-forest text-white' : 'bg-gray-100'}`}>{t.label}</button>
        ))}
      </div>

      <div className="card p-5 space-y-4">
        {msg && <p className="text-sm text-forest">{msg}</p>}

        {tab === 'about' && (
          <>
            <input className="input" placeholder="Heading" value={content.heading || ''} onChange={(e) => updateField('heading', e.target.value)} />
            <textarea className="input" rows={3} placeholder="Intro" value={content.intro || ''} onChange={(e) => updateField('intro', e.target.value)} />
            <textarea className="input" rows={2} placeholder="Mission" value={content.mission || ''} onChange={(e) => updateField('mission', e.target.value)} />
            <textarea className="input" rows={2} placeholder="Vision" value={content.vision || ''} onChange={(e) => updateField('vision', e.target.value)} />
          </>
        )}

        {tab === 'contact' && (
          <>
            <input className="input" placeholder="Phone" value={content.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            <input className="input" placeholder="Email" value={content.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            <input className="input" placeholder="Address" value={content.address || ''} onChange={(e) => updateField('address', e.target.value)} />
            <input className="input" placeholder="Google Maps embed HTML (optional)" value={content.map_embed || ''} onChange={(e) => updateField('map_embed', e.target.value)} />
          </>
        )}

        {['terms', 'privacy', 'cancellation_refund'].includes(tab) && (
          <textarea className="input" rows={14} placeholder="Content..." value={content.content || ''} onChange={(e) => updateField('content', e.target.value)} />
        )}

        <button onClick={save} className="btn-primary">Save</button>
      </div>
    </div>
  );
}
