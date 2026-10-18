'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import TourCard from '@/components/TourCard';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    api.get(`/destinations/${id}`).then((d) => { setDestination(d.destination); setTours(d.tours || []); }).catch(() => {});
  }, [id]);

  if (!destination) return <div className="section">Loading...</div>;

  return (
    <div>
      <div className="relative h-72 bg-gray-300">
        {destination.image_url && <Image src={destination.image_url} alt={destination.title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <h1 className="section !py-6 text-white font-heading text-4xl font-bold">{destination.title}</h1>
        </div>
      </div>
      <div className="section">
        <p className="text-gray-700 max-w-3xl mb-10">{destination.description}</p>
        <h2 className="font-heading text-2xl font-bold text-forest-dark mb-6">Tours to {destination.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
          {tours.length === 0 && <p className="text-gray-500">No tours yet for this destination.</p>}
        </div>
      </div>
    </div>
  );
}
