'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminSeats() {
  const [tours, setTours] = useState([]);
  const [tourId, setTourId] = useState('');
  const [tourDates, setTourDates] = useState([]);
  const [tourDateId, setTourDateId] = useState('');
  const [seats, setSeats] = useState([]);

  useEffect(() => { api.get('/tours/admin/all', { auth: true }).then((d) => setTours(d.tours || [])).catch(() => {}); }, []);

  function loadDates(id) {
    setTourId(id);
    setTourDateId('');
    setSeats([]);
    if (id) api.get(`/tours/${id}/dates`).then((d) => setTourDates(d.tour_dates || [])).catch(() => {});
    else setTourDates([]);
  }

  function loadSeats(id) {
    setTourDateId(id);
    if (id) api.get(`/seats/tour-date/${id}`).then((d) => setSeats(d.seats || [])).catch(() => {});
    else setSeats([]);
  }

  async function toggle(seat) {
    if (seat.status === 'booked') return;
    const endpoint = seat.status === 'blocked' ? 'unblock' : 'block';
    await api.put(`/seats/${seat.id}/${endpoint}`, {}, { auth: true });
    loadSeats(tourDateId);
  }

  const counts = {
    available: seats.filter((s) => s.status === 'available').length,
    booked: seats.filter((s) => s.status === 'booked').length,
    blocked: seats.filter((s) => s.status === 'blocked').length,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Seat Management</h1>

      <div className="flex gap-3 flex-wrap mb-6">
        <select className="input max-w-md" value={tourId} onChange={(e) => loadDates(e.target.value)}>
          <option value="">Select a tour...</option>
          {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        {tourId && (
          <select className="input max-w-xs" value={tourDateId} onChange={(e) => loadSeats(e.target.value)}>
            <option value="">Select a departure date...</option>
            {tourDates.map((d) => <option key={d.id} value={d.id}>{d.start_date}{d.vehicle ? ` — ${d.vehicle.name}` : ''}</option>)}
          </select>
        )}
      </div>

      {tourId && tourDates.length === 0 && (
        <p className="text-sm text-gray-400">This tour has no departure dates yet — add one from the Tours tab (Dates panel) first.</p>
      )}

      {tourDateId && (
        <>
          <div className="flex gap-4 mb-4 text-sm">
            <span className="text-green-600 font-semibold">{counts.available} Available</span>
            <span className="text-gray-500 font-semibold">{counts.booked} Booked</span>
            <span className="text-yellow-600 font-semibold">{counts.blocked} Blocked</span>
          </div>
          {seats.length === 0 ? (
            <p className="text-sm text-gray-400">No seats generated for this date yet — go to the Tours tab → Dates panel → "Generate Seats".</p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-w-2xl">
              {seats.map((s) => (
                <button
                  key={s.id}
                  disabled={s.status === 'booked'}
                  onClick={() => toggle(s)}
                  className={`h-12 rounded-lg text-xs font-bold flex items-center justify-center
                    ${s.status === 'available' ? 'bg-green-500 text-white' : ''}
                    ${s.status === 'booked' ? 'bg-gray-400 text-white cursor-not-allowed' : ''}
                    ${s.status === 'blocked' ? 'bg-yellow-400 text-white' : ''}
                  `}
                  title={`Click to ${s.status === 'blocked' ? 'unblock' : 'block'}`}
                >
                  {s.seat_number}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">Click a seat to block/unblock it. Booked seats cannot be modified here — cancel the booking instead.</p>
        </>
      )}
    </div>
  );
}
