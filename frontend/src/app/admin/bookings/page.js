'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import NewBookingModal from '@/components/NewBookingModal';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-200 text-gray-700',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  function load() {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/bookings/admin/all?${params.toString()}`, { auth: true }).then((d) => setBookings(d.bookings || [])).catch(() => {});
  }
  useEffect(load, [status, search]);

  async function updateStatus(id, newStatus) {
    await api.put(`/bookings/${id}/status`, { status: newStatus }, { auth: true });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this booking permanently?')) return;
    await api.del(`/bookings/${id}`, { auth: true });
    load();
  }

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <h1 className="font-heading text-2xl font-bold text-forest-dark">Bookings</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary">+ New Booking</button>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input placeholder="Search by ID, name, email..." className="input max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showNew && (
        <NewBookingModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="card p-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <p className="font-mono text-sm text-gray-400">{b.booking_id_string}</p>
                <p className="font-semibold text-forest-dark">{b.tour?.title}</p>
                <p className="text-sm text-gray-500">
                  {b.passenger_name} · {b.user?.email} · {b.pickup_point?.city_name} · Seats: {b.booking_seats?.map((s) => s.seat?.seat_number).join(', ')}
                </p>
                <p className="text-sm text-gray-500">Total: Rs. {Number(b.total_price).toLocaleString()} · {b.number_of_passengers} passenger(s)</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                <div className="flex gap-2 text-xs">
                  {['pending', 'confirmed', 'cancelled', 'completed'].filter((s) => s !== b.status).map((s) => (
                    <button key={s} onClick={() => updateStatus(b.id, s)} className="text-forest hover:underline">{s}</button>
                  ))}
                  <button onClick={() => remove(b.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-gray-500">No bookings found.</p>}
      </div>
    </div>
  );
}
