'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const empty = { name: '', vehicle_number: '', total_seats: 32, layout: '2-2', status: 'active' };

export default function AdminVehicles() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  function load() { api.get('/vehicles', { auth: true }).then((d) => setList(d.vehicles || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, total_seats: Number(form.total_seats) };
      if (editId) await api.put(`/vehicles/${editId}`, payload, { auth: true });
      else await api.post('/vehicles', payload, { auth: true });
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function deactivate(id) {
    if (!confirm('Deactivate this vehicle? It stays linked to any past tour dates.')) return;
    await api.del(`/vehicles/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-1">Vehicles / Coasters</h1>
      <p className="text-sm text-gray-500 mb-6">Manage reusable coasters (seat capacity + layout) that you assign to specific tour departure dates.</p>

      <form onSubmit={handleSubmit} className="card p-4 flex gap-3 items-end mb-6 flex-wrap">
        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        <div>
          <label className="label">Name</label>
          <input required className="input" placeholder="e.g. Coaster C5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Vehicle Number</label>
          <input className="input" placeholder="e.g. LEA-1234" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
        </div>
        <div>
          <label className="label">Total Seats</label>
          <input type="number" required className="input w-28" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
        </div>
        <div>
          <label className="label">Layout</label>
          <select className="input" value={form.layout} onChange={(e) => setForm({ ...form, layout: e.target.value })}>
            <option value="2-2">2 + 2</option>
            <option value="2-1">2 + 1</option>
            <option value="3-2">3 + 2</option>
          </select>
        </div>
        <button className="btn-primary">{editId ? 'Update' : 'Add Vehicle'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="text-sm text-gray-500">Cancel</button>}
      </form>

      <div className="card divide-y">
        {list.map((v) => (
          <div key={v.id} className="p-4 flex justify-between items-center">
            <div>
              <span className="font-semibold">{v.name}</span>{' '}
              <span className="text-gray-400 text-sm">{v.vehicle_number} · {v.total_seats} seats · {v.layout} layout</span>{' '}
              <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{v.status}</span>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => { setEditId(v.id); setForm({ name: v.name, vehicle_number: v.vehicle_number || '', total_seats: v.total_seats, layout: v.layout, status: v.status }); }} className="text-forest">Edit</button>
              {v.status === 'active' && <button onClick={() => deactivate(v.id)} className="text-red-500">Deactivate</button>}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-gray-500">No vehicles yet — add one above, then assign it to a tour's departure date.</p>}
      </div>
    </div>
  );
}
