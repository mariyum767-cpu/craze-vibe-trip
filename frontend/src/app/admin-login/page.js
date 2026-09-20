'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        logout();
        setError('This login is for admin accounts only. Use the regular Login page instead.');
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section max-w-md">
      <div className="text-center mb-6">
        <h1 className="font-heading text-3xl font-bold text-forest-dark">Admin Login</h1>
        <p className="text-sm text-gray-500 mt-1">Restricted access — Craze Vibes Trips staff only.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4 border-2 border-forest-dark/10">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
        <div>
          <label className="label">Admin Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
        <div className="flex justify-between items-center">
          <label className="label mb-0">Password</label>
          <Link href="/forgot-password" className="text-xs text-forest">Forgot password?</Link>
        </div>
          <input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login to Admin Panel'}</button>
        <p className="text-sm text-center text-gray-500">
          Not an admin? <Link href="/login" className="text-forest font-semibold">User Login</Link>
        </p>
      </form>
    </div>
  );
}
