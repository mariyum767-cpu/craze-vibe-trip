'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  useEffect(() => { api.get('/destinations').then((d) => setDestinations(d.destinations || [])).catch(() => {}); }, []);

  return (
    <div className="section">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-8">Northern Areas Destinations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((d) => (
          <Link key={d.id} href={`/destinations/${d.id}`} className="card">
            <div className="relative h-48 bg-gray-200">
              {d.image_url && <Image src={d.image_url} alt={d.title} fill className="object-cover" />}
            </div>
            <div className="p-5">
              <h3 className="font-heading font-semibold text-lg text-forest-dark">{d.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{d.description}</p>
            </div>
          </Link>
        ))}
        {destinations.length === 0 && <p className="text-gray-500">Destinations will appear here once added by admin.</p>}
      </div>
    </div>
  );
}
