'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';

const empty = { title: '', description: '', image_url: '' };

export default function AdminDestinations() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  function load() { api.get('/destinations').then((d) => setList(d.destinations || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/destinations/${editId}`, form, { auth: true });
      else await api.post('/destinations', form, { auth: true });
      setForm(empty); setEditId(null); load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this destination?')) return;
    await api.del(`/destinations/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Destinations</h1>
      <form onSubmit={handleSubmit} className="card p-4 space-y-3 mb-6">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input required className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <ImageUploadField label="Image" folder="destinations" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
        <div className="flex gap-3">
          <button className="btn-primary">{editId ? 'Update' : 'Add Destination'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="text-sm text-gray-500">Cancel</button>}
        </div>
      </form>
      <div className="card divide-y">
        {list.map((d) => (
          <div key={d.id} className="p-4 flex justify-between items-center">
            <span className="font-medium">{d.title}</span>
            <div className="flex gap-3 text-sm">
              <button onClick={() => { setEditId(d.id); setForm({ title: d.title, description: d.description || '', image_url: d.image_url || '' }); }} className="text-forest">Edit</button>
              <button onClick={() => remove(d.id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-gray-500">No destinations yet.</p>}
      </div>
    </div>
  );
}
