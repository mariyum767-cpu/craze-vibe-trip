'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('');

  function load() {
    api.get(`/reviews/admin/all${status ? `?status=${status}` : ''}`, { auth: true }).then((d) => setReviews(d.reviews || [])).catch(() => {});
  }
  useEffect(load, [status]);

  async function setReviewStatus(id, s) {
    await api.put(`/reviews/${id}/status`, { status: s }, { auth: true });
    load();
  }
  async function remove(id) {
    if (!confirm('Delete this review?')) return;
    await api.del(`/reviews/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Reviews & Feedback</h1>
      <select className="input max-w-xs mb-6" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold text-forest-dark">{r.user?.name} — {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              <p className="text-sm text-gray-500">{r.tour?.title}</p>
              <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-sm">
              <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
              <div className="flex gap-2">
                {r.status !== 'approved' && <button onClick={() => setReviewStatus(r.id, 'approved')} className="text-green-600">Approve</button>}
                {r.status !== 'rejected' && <button onClick={() => setReviewStatus(r.id, 'rejected')} className="text-red-500">Reject</button>}
                <button onClick={() => remove(r.id)} className="text-gray-500">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
      </div>
    </div>
  );
}
