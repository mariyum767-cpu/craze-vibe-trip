'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section max-w-md">
      <h1 className="font-heading text-3xl font-bold text-forest-dark mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
        <div>
          <label className="label">Full Name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Register'}</button>
        <p className="text-sm text-center text-gray-500">
          Already have an account? <Link href="/login" className="text-forest font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
}
