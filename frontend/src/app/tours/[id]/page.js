'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SeatMap from '@/components/SeatMap';

const STEPS = ['Select Date', 'Select Coaster', 'Pickup Point', 'Select Seats', 'Passenger Details', 'Summary', 'Confirmed'];

export default function TourDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tourDates, setTourDates] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [tourDateId, setTourDateId] = useState(''); // the chosen coaster's tour_date row id
  const [pickupId, setPickupId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passenger, setPassenger] = useState({ passenger_name: '', passenger_phone: '', passenger_email: '', cnic: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Unique departure dates — one date can have several coasters running
  const uniqueDates = [...new Set(tourDates.map((d) => d.start_date))].sort();
  // Coasters (tour_dates rows) available on the currently selected date
  const coastersForSelectedDate = tourDates.filter((d) => d.start_date === selectedDate);

  useEffect(() => {
    api.get(`/tours/${id}`).then((d) => {
      setTour(d.tour);
      setPickupPoints(d.pickup_points || []);
      setReviews(d.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
    api.get(`/tours/${id}/dates`).then((d) => setTourDates((d.tour_dates || []).filter((td) => td.status === 'scheduled'))).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!tourDateId) { setSeats([]); return; }
    api.get(`/seats/tour-date/${tourDateId}`).then((d) => setSeats(d.seats || [])).catch(() => {});
    setSelectedSeats([]);
  }, [tourDateId]);

  function chooseDate(date) {
    setSelectedDate(date);
    setTourDateId('');
    const coasters = tourDates.filter((d) => d.start_date === date);
    if (coasters.length === 1) {
      // Only one coaster runs this date — select it automatically and move on
      setTourDateId(coasters[0].id);
      setStep(2);
    } else {
      setStep(1);
    }
  }

  useEffect(() => {
    if (user) {
      setPassenger((p) => ({ ...p, passenger_name: user.name || '', passenger_email: user.email || '', passenger_phone: user.phone || '' }));
    }
  }, [user]);

  function toggleSeat(seat) {
    setSelectedSeats((prev) => prev.includes(seat.id) ? prev.filter((s) => s !== seat.id) : [...prev, seat.id]);
  }

  async function handleConfirm() {
    if (!user) { router.push('/login'); return; }
    setSubmitting(true);
    setError('');
    try {
      const { booking } = await api.post('/bookings', {
        tour_id: id,
        tour_date_id: tourDateId,
        pickup_point_id: pickupId,
        seat_ids: selectedSeats,
        ...passenger,
        number_of_passengers: selectedSeats.length,
      }, { auth: true });
      setConfirmedBooking(booking);
      setStep(6);
      const refreshed = await api.get(`/seats/tour-date/${tourDateId}`);
      setSeats(refreshed.seats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="section">Loading...</div>;
  if (!tour) return <div className="section">Tour not found.</div>;

  const totalPrice = Number(tour.price) * selectedSeats.length;

  return (
    <div>
      <div className="relative h-80 w-full bg-gray-300">
        {tour.cover_image && <Image src={tour.cover_image} alt={tour.title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="section !py-8 text-white">
            <h1 className="font-heading text-4xl font-bold">{tour.title}</h1>
            <p className="mt-1">{tour.destination?.title} · {tour.duration?.label || `${tour.duration?.days} Days`}</p>
          </div>
        </div>
      </div>

      <div className="section grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-forest-dark mb-3">Overview</h2>
            <p className="text-gray-700 whitespace-pre-line">{tour.detailed_description || tour.short_description}</p>
          </div>

          {tour.itineraries?.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-forest-dark mb-3">Day-by-Day Itinerary</h2>
              <div className="space-y-3">
                {tour.itineraries.sort((a,b) => a.day_number - b.day_number).map((day) => (
                  <div key={day.id} className="border-l-4 border-forest pl-4 py-1">
                    <p className="font-semibold text-forest-dark">Day {day.day_number}: {day.title}</p>
                    <p className="text-sm text-gray-600">{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {tour.included_services?.length > 0 && (
              <div>
                <h3 className="font-semibold text-forest-dark mb-2">Included</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {tour.included_services.map((s, i) => <li key={i}>✓ {s}</li>)}
                </ul>
              </div>
            )}
            {tour.excluded_services?.length > 0 && (
              <div>
                <h3 className="font-semibold text-forest-dark mb-2">Excluded</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {tour.excluded_services.map((s, i) => <li key={i}>✗ {s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {tour.transport_info && (
            <div>
              <h3 className="font-semibold text-forest-dark mb-2">Transport</h3>
              <p className="text-sm text-gray-700">{tour.transport_info}</p>
            </div>
          )}

          {tour.instructions && (
            <div>
              <h3 className="font-semibold text-forest-dark mb-2">Important Instructions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{tour.instructions}</p>
            </div>
          )}

          {tour.terms_and_conditions && (
            <div>
              <h3 className="font-semibold text-forest-dark mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{tour.terms_and_conditions}</p>
            </div>
          )}

          <div>
            <h2 className="font-heading text-2xl font-bold text-forest-dark mb-3">Reviews</h2>
            {reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b pb-3">
                    <p className="font-semibold text-forest-dark">{r.user?.name || 'Traveler'} — {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: booking widget */}
        <div id="book" className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-forest">Rs. {Number(tour.price).toLocaleString()}</span>
              <span className="text-sm text-gray-500">/ seat</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{tour.available_seats} seats configured · pick a departure date below</p>

            <div className="flex gap-1 mb-5 text-[10px] font-medium text-gray-400">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-forest' : 'bg-gray-200'}`} />
              ))}
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded mb-3">{error}</p>}

            {step === 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-forest-dark">Select Departure Date</h3>
                {uniqueDates.length === 0 && <p className="text-sm text-gray-400">No upcoming departure dates for this tour yet — check back soon.</p>}
                {uniqueDates.map((date) => {
                  const coasterCount = tourDates.filter((d) => d.start_date === date).length;
                  return (
                    <label key={date} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:border-forest">
                      <span className="text-sm">
                        {date} <span className="text-gray-400">({coasterCount} coaster{coasterCount > 1 ? 's' : ''} available)</span>
                      </span>
                      <input type="radio" name="tourDate" checked={selectedDate === date} onChange={() => chooseDate(date)} />
                    </label>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-forest-dark">Select Coaster</h3>
                <p className="text-xs text-gray-500">More than one coaster runs on {selectedDate} — pick one.</p>
                {coastersForSelectedDate.map((d) => (
                  <label key={d.id} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:border-forest">
                    <span className="text-sm">
                      {d.vehicle ? `${d.vehicle.name} — ${d.vehicle.total_seats} seats (${d.vehicle.layout})` : 'Coaster'}
                    </span>
                    <input type="radio" name="coaster" checked={tourDateId === d.id} onChange={() => setTourDateId(d.id)} />
                  </label>
                ))}
                <div className="flex gap-2">
                  <button onClick={() => setStep(0)} className="flex-1 border rounded-full py-2 text-sm">Back</button>
                  <button disabled={!tourDateId} onClick={() => setStep(2)} className="flex-1 btn-primary disabled:opacity-40">Continue</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-forest-dark">Select Pickup Point</h3>
                {pickupPoints.map((p) => (
                  <label key={p.id} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:border-forest">
                    <span className="text-sm">{p.city_name} <span className="text-gray-400">({p.pickup_time})</span></span>
                    <input type="radio" name="pickup" checked={pickupId === p.id} onChange={() => setPickupId(p.id)} />
                  </label>
                ))}
                <div className="flex gap-2">
                  <button onClick={() => setStep(coastersForSelectedDate.length > 1 ? 1 : 0)} className="flex-1 border rounded-full py-2 text-sm">Back</button>
                  <button disabled={!pickupId} onClick={() => setStep(3)} className="flex-1 btn-primary disabled:opacity-40">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-forest-dark">Select Seats</h3>
                <SeatMap seats={seats} selected={selectedSeats} onToggle={toggleSeat} />
                <p className="text-sm text-center text-gray-500">{selectedSeats.length} seat(s) selected — Rs. {totalPrice.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 border rounded-full py-2 text-sm">Back</button>
                  <button disabled={selectedSeats.length === 0} onClick={() => setStep(4)} className="flex-1 btn-primary disabled:opacity-40">Continue</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-forest-dark">Passenger Details</h3>
                <input className="input" placeholder="Full Name" value={passenger.passenger_name} onChange={(e) => setPassenger({ ...passenger, passenger_name: e.target.value })} />
                <input className="input" placeholder="Phone Number" value={passenger.passenger_phone} onChange={(e) => setPassenger({ ...passenger, passenger_phone: e.target.value })} />
                <input className="input" placeholder="Email" value={passenger.passenger_email} onChange={(e) => setPassenger({ ...passenger, passenger_email: e.target.value })} />
                <input className="input" placeholder="CNIC (optional)" value={passenger.cnic} onChange={(e) => setPassenger({ ...passenger, cnic: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={() => setStep(3)} className="flex-1 border rounded-full py-2 text-sm">Back</button>
                  <button
                    disabled={!passenger.passenger_name || !passenger.passenger_phone || !passenger.passenger_email}
                    onClick={() => setStep(5)}
                    className="flex-1 btn-primary disabled:opacity-40"
                  >Continue</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-forest-dark">Booking Summary</h3>
                <p><b>Tour:</b> {tour.title}</p>
                <p><b>Date:</b> {selectedDate}</p>
                <p><b>Coaster:</b> {tourDates.find((d) => d.id === tourDateId)?.vehicle?.name || '—'}</p>
                <p><b>Pickup:</b> {pickupPoints.find((p) => p.id === pickupId)?.city_name}</p>
                <p><b>Seats:</b> {seats.filter((s) => selectedSeats.includes(s.id)).map((s) => s.seat_number).join(', ')}</p>
                <p><b>Passenger:</b> {passenger.passenger_name}</p>
                <p><b>Total:</b> Rs. {totalPrice.toLocaleString()}</p>
                {!user && <p className="text-red-600">Please login to confirm your booking.</p>}
                <div className="flex gap-2">
                  <button onClick={() => setStep(4)} className="flex-1 border rounded-full py-2 text-sm">Back</button>
                  <button disabled={submitting} onClick={handleConfirm} className="flex-1 btn-primary disabled:opacity-40">
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}

            {step === 6 && confirmedBooking && (
              <div className="text-center space-y-2">
                <div className="text-3xl">✅</div>
                <h3 className="font-heading text-lg font-bold text-forest-dark">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-mono font-bold text-forest">{confirmedBooking.booking_id_string}</p>
                <p className="text-sm text-gray-600">Status: {confirmedBooking.status}</p>
                <button onClick={() => router.push('/dashboard')} className="btn-primary w-full mt-3">Go to My Bookings</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
