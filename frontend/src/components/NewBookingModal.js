'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Admin-only modal: create a booking manually for a walk-in / phone customer.
// Uses the same atomic seat-locking backend function as the public booking
// flow, so double-booking is impossible here too.
export default function NewBookingModal({ onClose, onCreated }) {
  const [tours, setTours] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [tourDates, setTourDates] = useState([]);
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState({
    tour_id: '', tour_date_id: '', pickup_point_id: '', seat_ids: [],
    passenger_name: '', passenger_phone: '', passenger_email: '', cnic: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/tours/admin/all', { auth: true }).then((d) => setTours(d.tours || [])).catch(() => {});
    api.get('/pickup-points').then((d) => setPickupPoints(d.pickupPoints || d.pickup_points || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.tour_id) { setTourDates([]); return; }
    api.get(`/tours/${form.tour_id}/dates`).then((d) => setTourDates((d.tour_dates || []).filter((td) => td.status === 'scheduled'))).catch(() => setTourDates([]));
    setForm((f) => ({ ...f, tour_date_id: '', seat_ids: [] }));
  }, [form.tour_id]);

  useEffect(() => {
    if (!form.tour_date_id) { setSeats([]); return; }
    api.get(`/seats/tour-date/${form.tour_date_id}`).then((d) => setSeats(d.seats || [])).catch(() => setSeats([]));
    setForm((f) => ({ ...f, seat_ids: [] }));
  }, [form.tour_date_id]);

  function toggleSeat(seat) {
    if (seat.status !== 'available') return;
    setForm((f) => ({
      ...f,
      seat_ids: f.seat_ids.includes(seat.id) ? f.seat_ids.filter((id) => id !== seat.id) : [...f.seat_ids, seat.id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.tour_id || !form.tour_date_id || !form.pickup_point_id || form.seat_ids.length === 0 || !form.passenger_name || !form.passenger_phone) {
      setError('Tour, departure date, pickup point, at least one seat, passenger name and phone are required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/bookings/admin/create', {
        ...form,
        number_of_passengers: form.seat_ids.length,
      }, { auth: true });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-bold text-forest-dark">New Booking (Walk-in / Phone)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}

          <div>
            <label className="label">Tour</label>
            <select required className="input" value={form.tour_id} onChange={(e) => setForm({ ...form, tour_id: e.target.value })}>
              <option value="">Select a tour</option>
              {tours.map((t) => <option key={t.id} value={t.id}>{t.title} — Rs. {Number(t.price).toLocaleString()}</option>)}
            </select>
          </div>

          {form.tour_id && (
            <div>
              <label className="label">Departure Date</label>
              <select required className="input" value={form.tour_date_id} onChange={(e) => setForm({ ...form, tour_date_id: e.target.value })}>
                <option value="">Select a date</option>
                {tourDates.map((d) => <option key={d.id} value={d.id}>{d.start_date}{d.vehicle ? ` — ${d.vehicle.name}` : ''}</option>)}
              </select>
              {tourDates.length === 0 && <p className="text-xs text-gray-400 mt-1">No departure dates for this tour yet — add one from the Tours tab first.</p>}
            </div>
          )}

          <div>
            <label className="label">Pickup Point</label>
            <select required className="input" value={form.pickup_point_id} onChange={(e) => setForm({ ...form, pickup_point_id: e.target.value })}>
              <option value="">Select a pickup point</option>
              {pickupPoints.map((p) => <option key={p.id} value={p.id}>{p.city_name} — {p.pickup_time}</option>)}
            </select>
          </div>

          {form.tour_date_id && (
            <div>
              <label className="label">Seats ({form.seat_ids.length} selected)</label>
              {seats.length === 0 ? (
                <p className="text-sm text-gray-400">No seats found for this tour yet — generate seats for it first from the Tours tab.</p>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {seats.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSeat(s)}
                      disabled={s.status !== 'available'}
                      className={`text-xs py-1.5 rounded font-semibold ${
                        form.seat_ids.includes(s.id) ? 'bg-red-500 text-white'
                        : s.status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {s.seat_number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="Passenger Full Name" className="input" value={form.passenger_name} onChange={(e) => setForm({ ...form, passenger_name: e.target.value })} />
            <input required placeholder="Phone Number" className="input" value={form.passenger_phone} onChange={(e) => setForm({ ...form, passenger_phone: e.target.value })} />
            <input type="email" placeholder="Email (optional)" className="input" value={form.passenger_email} onChange={(e) => setForm({ ...form, passenger_email: e.target.value })} />
            <input placeholder="CNIC (optional)" className="input" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Booking'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
