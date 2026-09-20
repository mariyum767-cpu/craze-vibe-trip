'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminDurations() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ days: '', label: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  function load() { api.get('/durations').then((d) => setList(d.durations || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { days: Number(form.days), label: form.label };
      if (editId) await api.put(`/durations/${editId}`, payload, { auth: true });
      else await api.post('/durations', payload, { auth: true });
      setForm({ days: '', label: '' });
      setEditId(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this duration?')) return;
    await api.del(`/durations/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Tour Durations</h1>
      <form onSubmit={handleSubmit} className="card p-4 flex gap-3 items-end mb-6 flex-wrap">
        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        <div>
          <label className="label">Days</label>
          <input type="number" required className="input w-24" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} />
        </div>
        <div>
          <label className="label">Label</label>
          <input required className="input" placeholder="e.g. 3 Days Tour" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <button className="btn-primary">{editId ? 'Update' : 'Add Duration'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ days: '', label: '' }); }} className="text-sm text-gray-500">Cancel</button>}
      </form>

      <div className="card divide-y">
        {list.map((d) => (
          <div key={d.id} className="p-4 flex justify-between items-center">
            <span>{d.label} <span className="text-gray-400 text-sm">({d.days} days)</span></span>
            <div className="flex gap-3 text-sm">
              <button onClick={() => { setEditId(d.id); setForm({ days: d.days, label: d.label }); }} className="text-forest">Edit</button>
              <button onClick={() => remove(d.id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-gray-500">No durations yet.</p>}
      </div>
    </div>
  );
}
