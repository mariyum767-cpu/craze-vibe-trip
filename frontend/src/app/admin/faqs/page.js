'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const empty = { question: '', answer: '', category: 'general', order_index: 0 };

export default function AdminFaqs() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  function load() { api.get('/faqs').then((d) => setList(d.faqs || [])).catch(() => {}); }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, order_index: Number(form.order_index) };
      if (editId) await api.put(`/faqs/${editId}`, payload, { auth: true });
      else await api.post('/faqs', payload, { auth: true });
      setForm(empty); setEditId(null); load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this FAQ?')) return;
    await api.del(`/faqs/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">FAQ Management</h1>
      <form onSubmit={handleSubmit} className="card p-4 space-y-3 mb-6">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input required className="input" placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <textarea required className="input" placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <div className="flex gap-3">
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" className="input w-28" placeholder="Order" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: e.target.value })} />
        </div>
        <div className="flex gap-3">
          <button className="btn-primary">{editId ? 'Update' : 'Add FAQ'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="text-sm text-gray-500">Cancel</button>}
        </div>
      </form>
      <div className="card divide-y">
        {list.map((f) => (
          <div key={f.id} className="p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold text-forest-dark">{f.question}</p>
              <p className="text-sm text-gray-600">{f.answer}</p>
              <p className="text-xs text-gray-400 mt-1">Category: {f.category} · Order: {f.order_index}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => { setEditId(f.id); setForm({ question: f.question, answer: f.answer, category: f.category, order_index: f.order_index }); }} className="text-forest">Edit</button>
              <button onClick={() => remove(f.id)} className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-gray-500">No FAQs yet.</p>}
      </div>
    </div>
  );
}
