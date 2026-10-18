'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-2xl leading-none ${onChange ? 'cursor-pointer' : 'cursor-default'} ${n <= value ? 'text-sunset' : 'text-gray-300'}`}
        >★</button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState({ tour_id: '', rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/reviews').then((d) => setReviews(d.reviews || [])).catch(() => {});
    api.get('/tours').then((d) => setTours(d.tours || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.tour_id) { setError('Please select which tour you\'re reviewing.'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', form, { auth: true });
      setSuccess('Thank you! Your review has been submitted and will appear here once approved by our team.');
      setForm({ tour_id: '', rating: 5, comment: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-2">Traveler Reviews</h1>
      <p className="text-gray-600 mb-8">What our travelers are saying about their trips with Craze Vibes Trips.</p>

      <div className="card p-6 mb-10">
        <h2 className="font-heading text-xl font-bold text-forest-dark mb-4">Share Your Experience</h2>
        {!user ? (
          <p className="text-sm text-gray-500">Please <a href="/login" className="text-forest font-semibold">login</a> to leave a review.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {success && <p className="text-green-700 text-sm bg-green-50 p-2 rounded">{success}</p>}
            <div>
              <label className="label">Which tour did you take?</label>
              <select required className="input" value={form.tour_id} onChange={(e) => setForm({ ...form, tour_id: e.target.value })}>
                <option value="">Select a tour</option>
                {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Your Rating</label>
              <Stars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
            </div>
            <div>
              <label className="label">Your Feedback</label>
              <textarea rows={3} className="input" placeholder="Tell other travelers about your experience..." value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
            <button disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Review'}</button>
          </form>
        )}
      </div>

      <h2 className="font-heading text-xl font-bold text-forest-dark mb-4">All Reviews</h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-forest-dark">{r.user?.name || 'Traveler'}</p>
                <p className="text-xs text-gray-400">{r.tour?.title}</p>
              </div>
              <Stars value={r.rating} />
            </div>
            {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet — be the first to share your experience!</p>}
      </div>
    </div>
  );
}
