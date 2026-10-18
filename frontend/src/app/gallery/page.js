'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get(`/gallery${category ? `?category=${category}` : ''}`).then((d) => setItems(d.gallery || [])).catch(() => {});
  }, [category]);

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  return (
    <div className="section">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-6">Gallery</h1>
      {categories.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button onClick={() => setCategory('')} className={`px-4 py-1.5 rounded-full text-sm ${!category ? 'bg-forest text-white' : 'bg-gray-100'}`}>All</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-sm ${category === c ? 'bg-forest text-white' : 'bg-gray-100'}`}>{c}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((img) => (
          <button key={img.id} onClick={() => setLightbox(img)} className="relative h-40 rounded-xl overflow-hidden">
            <Image src={img.image_url} alt={img.title || ''} fill className="object-cover hover:scale-105 transition" />
          </button>
        ))}
        {items.length === 0 && <p className="text-gray-500 col-span-4">Gallery images will appear here once added by admin.</p>}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setLightbox(null)}>
          <div className="relative w-full max-w-3xl h-[70vh]">
            <Image src={lightbox.image_url} alt={lightbox.title || ''} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
