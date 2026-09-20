'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!token) { setError('Missing or invalid reset link. Please request a new one.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 space-y-4">
      {!token && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">No reset token found in the link. Please request a new one from the <Link href="/forgot-password" className="underline">Forgot Password</Link> page.</p>}
      {success ? (
        <p className="text-green-700 text-sm bg-green-50 p-3 rounded">Password updated! Redirecting you to login...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
          <div>
            <label className="label">New Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" required minLength={6} className="input" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button disabled={loading || !token} className="btn-primary w-full disabled:opacity-40">{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="section max-w-md">
      <h1 className="font-heading text-3xl font-bold text-forest-dark mb-6 text-center">Reset Password</h1>
      <Suspense fallback={<p className="text-center text-gray-400">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
