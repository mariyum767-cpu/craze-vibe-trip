'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const empty = { city_name: '', address: '', pickup_time: '', status: 'active' };

export default function AdminPickupPoints() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  function load() { api.get('/pickup-points?active_only=false').then((d) => setList(d.pickup_points || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/pickup-points/${editId}`, form, { auth: true });
      else await api.post('/pickup-points', form, { auth: true });
      setForm(empty); setEditId(null); load();
    } catch (err) { setError(err.message); }
  }

  async function toggleStatus(p) {
    await api.put(`/pickup-points/${p.id}`, { status: p.status === 'active' ? 'inactive' : 'active' }, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Pickup Points</h1>
      <form onSubmit={handleSubmit} className="card p-4 flex gap-3 flex-wrap items-end mb-6">
        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        <div><label className="label">City</label><input required className="input" value={form.city_name} onChange={(e) => setForm({ ...form, city_name: e.target.value })} /></div>
        <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div><label className="label">Pickup Time</label><input type="time" required className="input" value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })} /></div>
        <button className="btn-primary">{editId ? 'Update' : 'Add'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="text-sm text-gray-500">Cancel</button>}
      </form>
      <div className="card divide-y">
        {list.map((p) => (
          <div key={p.id} className="p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">{p.city_name}</span>
              <span className="text-gray-400 text-sm ml-2">{p.pickup_time} · {p.address}</span>
            </div>
            <div className="flex gap-3 text-sm items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{p.status}</span>
              <button onClick={() => { setEditId(p.id); setForm({ city_name: p.city_name, address: p.address || '', pickup_time: p.pickup_time, status: p.status }); }} className="text-forest">Edit</button>
              <button onClick={() => toggleStatus(p)} className="text-red-500">{p.status === 'active' ? 'Disable' : 'Enable'}</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-gray-500">No pickup points yet.</p>}
      </div>
    </div>
  );
}
