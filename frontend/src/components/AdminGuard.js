'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin-login');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') return <div className="section">Checking access...</div>;
  return children;
}
