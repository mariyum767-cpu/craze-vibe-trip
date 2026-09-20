'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage(''); setDevResetUrl('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.message);
      if (res.devResetUrl) setDevResetUrl(res.devResetUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section max-w-md">
      <h1 className="font-heading text-3xl font-bold text-forest-dark mb-2 text-center">Forgot Password</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Enter your account email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
        {message && <p className="text-green-700 text-sm bg-green-50 p-3 rounded">{message}</p>}
        {devResetUrl && (
          <div className="text-xs bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p className="font-semibold mb-1">No email service configured — dev mode reset link:</p>
            <Link href={devResetUrl.replace(/^https?:\/\/[^/]+/, '')} className="text-forest break-all underline">{devResetUrl}</Link>
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        <p className="text-sm text-center text-gray-500">
          <Link href="/login" className="text-forest font-semibold">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
