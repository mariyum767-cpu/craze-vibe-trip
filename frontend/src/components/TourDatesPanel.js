'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Shown inside the admin Tours page for a given tour: lets the admin add
// multiple departure dates, assign a vehicle/coaster to each, and generate
// that date's seat map.
export default function TourDatesPanel({ tourId }) {
  const [dates, setDates] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ start_date: '', vehicle_id: '' });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function load() {
    api.get(`/tours/${tourId}/dates`).then((d) => setDates(d.tour_dates || [])).catch(() => {});
  }
  useEffect(() => {
    load();
    api.get('/vehicles', { auth: true }).then((d) => setVehicles((d.vehicles || []).filter((v) => v.status === 'active'))).catch(() => {});
  }, [tourId]);

  async function addDate(e) {
    e.preventDefault();
    setError('');
    if (!form.start_date) { setError('Pick a start date.'); return; }
    try {
      await api.post(`/tours/${tourId}/dates`, form, { auth: true });
      setForm({ start_date: '', vehicle_id: '' });
      load();
    } catch (err) { setError(err.message); }
  }

  async function removeDate(id) {
    if (!confirm('Delete this departure date? Any seats/bookings tied to it will be affected.')) return;
    await api.del(`/tours/dates/${id}`, { auth: true });
    load();
  }

  async function generateSeats(id) {
    setBusyId(id);
    setError('');
    try {
      await api.post(`/seats/tour-date/${id}/generate`, {}, { auth: true });
      load();
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-xs text-gray-500">A tour can run on several dates, each with its own coaster. Add dates below, assign a vehicle, then generate that date's seats.</p>

      {dates.length === 0 && <p className="text-sm text-gray-400">No departure dates yet.</p>}
      {dates.map((d) => (
        <div key={d.id} className="flex justify-between items-center bg-gray-50 rounded p-2 text-sm flex-wrap gap-2">
          <div>
            <b>{d.start_date}</b>{' '}
            <span className="text-gray-500">
              {d.vehicle ? `— ${d.vehicle.name} (${d.vehicle.total_seats} seats)` : '— no vehicle assigned'}
            </span>{' '}
            <span className="text-xs ml-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{d.status}</span>
          </div>
          <div className="flex gap-3 text-xs">
            <button onClick={() => generateSeats(d.id)} disabled={busyId === d.id} className="text-forest">
              {busyId === d.id ? 'Generating...' : 'Generate Seats'}
            </button>
            <button onClick={() => removeDate(d.id)} className="text-red-500">Remove</button>
          </div>
        </div>
      ))}

      <form onSubmit={addDate} className="flex gap-2 flex-wrap items-end">
        <div>
          <label className="label">Start Date</label>
          <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </div>
        <div>
          <label className="label">Vehicle / Coaster</label>
          <select className="input" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            <option value="">No vehicle yet</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.total_seats} seats)</option>)}
          </select>
        </div>
        <button className="btn-primary !py-2 !px-4 text-sm">Add Date</button>
      </form>
      {vehicles.length === 0 && <p className="text-xs text-gray-400">No vehicles yet — add one in the Vehicles / Coasters tab first.</p>}
    </div>
  );
}
