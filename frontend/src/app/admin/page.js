'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/stats', { auth: true }).then((d) => setStats(d.stats)).catch(() => {}); }, []);

  const cards = stats ? [
    { label: 'Total Tours', value: stats.total_tours },
    { label: 'Active Tours', value: stats.active_tours },
    { label: 'Total Bookings', value: stats.total_bookings },
    { label: 'Confirmed Bookings', value: stats.confirmed_bookings },
    { label: 'Pending Bookings', value: stats.pending_bookings },
    { label: 'Total Users', value: stats.total_users },
    { label: 'Available Seats', value: stats.available_seats },
    { label: 'Booked Seats', value: stats.booked_seats },
  ] : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-forest-dark mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-3xl font-bold text-forest-dark mt-1">{c.value}</p>
          </div>
        ))}
        {!stats && <p className="text-gray-500">Loading stats...</p>}
      </div>
    </div>
  );
}
