'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';

const empty = { title: '', category: '', image_url: '' };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  function load() { api.get('/gallery').then((d) => setItems(d.gallery || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/gallery', form, { auth: true });
      setForm(empty); load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this image?')) return;
    await api.del(`/gallery/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Gallery Management</h1>
      <form onSubmit={handleSubmit} className="card p-4 flex gap-3 flex-wrap items-end mb-6">
        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        <input className="input" placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Category (e.g. Hunza, Skardu)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <div className="flex-1 min-w-[240px]"><ImageUploadField label="Image" folder="gallery" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} /></div>
        <button className="btn-primary">Add Image</button>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {items.map((img) => (
          <div key={img.id} className="relative h-28 rounded-lg overflow-hidden group">
            <Image src={img.image_url} alt={img.title || ''} fill className="object-cover" />
            <button onClick={() => remove(img.id)} className="absolute top-1 right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100">✕</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-500 col-span-5">No images yet.</p>}
      </div>
    </div>
  );
}
