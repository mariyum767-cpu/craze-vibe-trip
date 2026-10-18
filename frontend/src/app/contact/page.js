'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => { api.get('/site-content/contact').then((d) => setContent(d.content?.content)).catch(() => {}); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Contact form is display-only in this build; wire to an email service or DB table as needed.
    setSent(true);
  }

  return (
    <div className="section grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h1 className="font-heading text-4xl font-bold text-forest-dark mb-6">Contact Us</h1>
        <div className="space-y-3 text-gray-700">
          <p><b>Phone:</b> {content?.phone || 'Set from Admin Panel'}</p>
          <p><b>Email:</b> {content?.email || 'Set from Admin Panel'}</p>
          <p><b>Address:</b> {content?.address || 'Set from Admin Panel'}</p>
        </div>
        {content?.map_embed && (
          <div className="mt-6 aspect-video rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: content.map_embed }} />
        )}
      </div>
      <div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="font-heading font-semibold text-lg text-forest-dark">Send a Message</h2>
          {sent && <p className="text-forest text-sm bg-forest/10 p-2 rounded">Thanks! We'll get back to you soon.</p>}
          <input required className="input" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" className="input" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea required className="input" rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  );
}
