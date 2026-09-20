'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  useEffect(() => { api.get('/site-content/privacy').then((d) => setContent(d.content?.content?.content || '')).catch(() => {}); }, []);
  return (
    <div className="section max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-6">Privacy Policy</h1>
      <div className="text-gray-700 whitespace-pre-line">{content || 'Privacy Policy content will appear here once set by admin.'}</div>
    </div>
  );
}
