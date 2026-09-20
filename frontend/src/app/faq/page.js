'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { api.get('/faqs').then((d) => setFaqs(d.faqs || [])).catch(() => {}); }, []);

  return (
    <div className="section max-w-3xl">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-8">Frequently Asked Questions</h1>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="card">
            <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full text-left p-4 flex justify-between items-center font-semibold text-forest-dark">
              {f.question}
              <span>{open === f.id ? '−' : '+'}</span>
            </button>
            {open === f.id && <p className="px-4 pb-4 text-sm text-gray-600">{f.answer}</p>}
          </div>
        ))}
        {faqs.length === 0 && <p className="text-gray-500">FAQs will appear here once added by admin.</p>}
      </div>
    </div>
  );
}
