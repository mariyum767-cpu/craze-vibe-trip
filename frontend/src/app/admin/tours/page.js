'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';
import TourDatesPanel from '@/components/TourDatesPanel';

const emptyTour = {
  title: '', destination_id: '', duration_id: '', price: '', cover_image: '',
  short_description: '', detailed_description: '', start_date: '', available_seats: 32,
  included_services: '', excluded_services: '', instructions: '', terms_and_conditions: '',
  transport_info: '', status: 'active',
};

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [durations, setDurations] = useState([]);
  const [form, setForm] = useState(emptyTour);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [expandedTour, setExpandedTour] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState('itinerary');
  const [itineraryForm, setItineraryForm] = useState({ day_number: '', title: '', description: '' });

  function load() { api.get('/tours/admin/all', { auth: true }).then((d) => setTours(d.tours || [])).catch(() => {}); }
  useEffect(() => {
    load();
    api.get('/destinations').then((d) => setDestinations(d.destinations || [])).catch(() => {});
    api.get('/durations').then((d) => setDurations(d.durations || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        available_seats: Number(form.available_seats),
        included_services: form.included_services ? form.included_services.split(',').map((s) => s.trim()) : [],
        excluded_services: form.excluded_services ? form.excluded_services.split(',').map((s) => s.trim()) : [],
      };
      let tourId = editId;
      if (editId) {
        await api.put(`/tours/${editId}`, payload, { auth: true });
      } else {
        const { tour } = await api.post('/tours', payload, { auth: true });
        tourId = tour.id;
        // auto-generate seats matching available_seats
        await api.post(`/seats/tour/${tourId}/generate`, { total_seats: payload.available_seats }, { auth: true }).catch(() => {});
      }
      setForm(emptyTour); setEditId(null); load();
    } catch (err) { setError(err.message); }
  }

  function editTour(t) {
    setEditId(t.id);
    setForm({
      title: t.title, destination_id: t.destination_id || '', duration_id: t.duration_id || '',
      price: t.price, cover_image: t.cover_image || '', short_description: t.short_description || '',
      detailed_description: t.detailed_description || '', start_date: t.start_date || '',
      available_seats: t.available_seats, included_services: (t.included_services || []).join(', '),
      excluded_services: (t.excluded_services || []).join(', '), instructions: t.instructions || '',
      terms_and_conditions: t.terms_and_conditions || '', transport_info: t.transport_info || '', status: t.status || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deactivate(id) {
    if (!confirm('Deactivate this tour?')) return;
    await api.del(`/tours/${id}`, { auth: true });
    load();
  }

  async function addItineraryDay(tourId) {
    await api.post(`/tours/${tourId}/itinerary`, { ...itineraryForm, day_number: Number(itineraryForm.day_number) }, { auth: true });
    setItineraryForm({ day_number: '', title: '', description: '' });
    load();
  }

  async function deleteItineraryDay(dayId) {
    await api.del(`/tours/itinerary/${dayId}`, { auth: true });
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-forest-dark mb-6">Manage Tours</h1>

      <form onSubmit={handleSubmit} className="card p-5 space-y-3 mb-8">
        <h2 className="font-semibold text-forest-dark">{editId ? 'Edit Tour' : 'Add New Tour'}</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <input required className="input" placeholder="Tour Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required type="number" className="input" placeholder="Price (Rs.)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <select required className="input" value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })}>
            <option value="">Select Destination</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <select required className="input" value={form.duration_id} onChange={(e) => setForm({ ...form, duration_id: e.target.value })}>
            <option value="">Select Duration</option>
            {durations.map((d) => <option key={d.id} value={d.id}>{d.label || `${d.days} Days`}</option>)}
          </select>
          <input required type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="number" className="input" placeholder="Total Seats (coaster capacity)" value={form.available_seats} onChange={(e) => setForm({ ...form, available_seats: e.target.value })} disabled={!!editId} />
        </div>
        <ImageUploadField label="Cover Image" folder="tours" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} />
        <textarea className="input" placeholder="Short Description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        <textarea className="input" rows={4} placeholder="Detailed Description" value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} />
        <input className="input" placeholder="Included Services (comma separated)" value={form.included_services} onChange={(e) => setForm({ ...form, included_services: e.target.value })} />
        <input className="input" placeholder="Excluded Services (comma separated)" value={form.excluded_services} onChange={(e) => setForm({ ...form, excluded_services: e.target.value })} />
        <input className="input" placeholder="Transport / Coaster Info" value={form.transport_info} onChange={(e) => setForm({ ...form, transport_info: e.target.value })} />
        <textarea className="input" placeholder="Important Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
        <textarea className="input" placeholder="Terms & Conditions" value={form.terms_and_conditions} onChange={(e) => setForm({ ...form, terms_and_conditions: e.target.value })} />
        <div className="flex gap-3">
          <button className="btn-primary">{editId ? 'Update Tour' : 'Create Tour'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyTour); }} className="text-sm text-gray-500">Cancel</button>}
        </div>
        {!editId && <p className="text-xs text-gray-400">Seats will be auto-generated in a 2+2 coaster layout matching "Total Seats".</p>}
      </form>

      <div className="space-y-3">
        {tours.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-forest-dark">{t.title} <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{t.status}</span></p>
                <p className="text-sm text-gray-500">{t.destination?.title} · Rs. {t.price} · {t.available_seats} seats left</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => { setExpandedTour(expandedTour === t.id && expandedPanel === 'itinerary' ? null : t.id); setExpandedPanel('itinerary'); }} className="text-forest">Itinerary</button>
                <button onClick={() => { setExpandedTour(expandedTour === t.id && expandedPanel === 'dates' ? null : t.id); setExpandedPanel('dates'); }} className="text-forest">Dates</button>
                <button onClick={() => editTour(t)} className="text-forest">Edit</button>
                <button onClick={() => deactivate(t.id)} className="text-red-500">Deactivate</button>
              </div>
            </div>

            {expandedTour === t.id && expandedPanel === 'dates' && <TourDatesPanel tourId={t.id} />}

            {expandedTour === t.id && expandedPanel === 'itinerary' && (
              <div className="mt-4 border-t pt-4 space-y-2">
                {(t.itineraries || []).sort((a,b) => a.day_number - b.day_number).map((day) => (
                  <div key={day.id} className="flex justify-between items-start bg-gray-50 rounded p-2 text-sm">
                    <div><b>Day {day.day_number}: {day.title}</b><p className="text-gray-500">{day.description}</p></div>
                    <button onClick={() => deleteItineraryDay(day.id)} className="text-red-500 text-xs">Remove</button>
                  </div>
                ))}
                <div className="flex gap-2 flex-wrap items-end">
                  <input type="number" placeholder="Day #" className="input w-20" value={itineraryForm.day_number} onChange={(e) => setItineraryForm({ ...itineraryForm, day_number: e.target.value })} />
                  <input placeholder="Title" className="input" value={itineraryForm.title} onChange={(e) => setItineraryForm({ ...itineraryForm, title: e.target.value })} />
                  <input placeholder="Description" className="input flex-1" value={itineraryForm.description} onChange={(e) => setItineraryForm({ ...itineraryForm, description: e.target.value })} />
                  <button onClick={() => addItineraryDay(t.id)} className="btn-primary !py-2 !px-4 text-sm">Add Day</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {tours.length === 0 && <p className="text-gray-500">No tours yet.</p>}
      </div>
    </div>
  );
}
