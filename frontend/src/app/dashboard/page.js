'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '' });
      api.get('/bookings/mine', { auth: true }).then((d) => setBookings(d.bookings || [])).catch(() => {});
    }
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await api.put('/auth/me', profile, { auth: true });
      setMsg('Profile updated.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (!user) return null;

  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="section">
      <h1 className="font-heading text-3xl font-bold text-forest-dark mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="font-semibold text-forest-dark mb-4">Profile</h2>
            <form onSubmit={saveProfile} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
              <button className="btn-primary w-full">Save Changes</button>
              {msg && <p className="text-sm text-forest">{msg}</p>}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-semibold text-forest-dark mb-4">Upcoming Trips</h2>
            {upcoming.length === 0 ? <p className="text-sm text-gray-500">No upcoming bookings.</p> : (
              <div className="space-y-3">
                {upcoming.map((b) => <BookingRow key={b.id} b={b} />)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-forest-dark mb-4">Previous Trips</h2>
            {past.length === 0 ? <p className="text-sm text-gray-500">No previous bookings.</p> : (
              <div className="space-y-3">
                {past.map((b) => <BookingRow key={b.id} b={b} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ b }) {
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-200 text-gray-700',
  }[b.status] || 'bg-gray-100';

  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-forest-dark">{b.tour?.title}</p>
        <p className="text-sm text-gray-500">{b.tour_date?.start_date} · {b.pickup_point?.city_name} · Seats: {b.booking_seats?.map((s) => s.seat?.seat_number).join(', ')}</p>
        <p className="text-xs font-mono text-gray-400">{b.booking_id_string}</p>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>{b.status}</span>
    </div>
  );
}
