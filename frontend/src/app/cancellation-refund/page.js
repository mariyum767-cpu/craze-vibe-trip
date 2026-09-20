'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CancellationRefundPage() {
  const [content, setContent] = useState('');
  useEffect(() => { api.get('/site-content/cancellation_refund').then((d) => setContent(d.content?.content?.content || '')).catch(() => {}); }, []);
  return (
    <div className="section max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-6">Cancellation & Refund Policy</h1>
      <div className="text-gray-700 whitespace-pre-line">{content || 'Cancellation & Refund Policy content will appear here once set by admin.'}</div>
    </div>
  );
}
