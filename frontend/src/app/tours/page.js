'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TourCard from '@/components/TourCard';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [durations, setDurations] = useState([]);
  const [filters, setFilters] = useState({ destination_id: '', duration_id: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/destinations').then((d) => setDestinations(d.destinations || [])).catch(() => {});
    api.get('/durations').then((d) => setDurations(d.durations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.destination_id) params.set('destination_id', filters.destination_id);
    if (filters.duration_id) params.set('duration_id', filters.duration_id);
    if (filters.search) params.set('search', filters.search);
    api.get(`/tours?${params.toString()}`)
      .then((d) => setTours(d.tours || []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="section">
      <h1 className="font-heading text-4xl font-bold text-forest-dark mb-2">All Tour Packages</h1>
      <p className="text-gray-500 mb-8">Find your next adventure across the Northern Areas of Pakistan.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Search tours..."
          className="input max-w-xs"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select className="input max-w-xs" value={filters.destination_id} onChange={(e) => setFilters({ ...filters, destination_id: e.target.value })}>
          <option value="">All Destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <select className="input max-w-xs" value={filters.duration_id} onChange={(e) => setFilters({ ...filters, duration_id: e.target.value })}>
          <option value="">All Durations</option>
          {durations.map((d) => <option key={d.id} value={d.id}>{d.label || `${d.days} Days`}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading tours...</p>
      ) : tours.length === 0 ? (
        <p className="text-gray-500">No tours found matching your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      )}
    </div>
  );
}
