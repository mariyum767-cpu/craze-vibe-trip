'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TourCard from '@/components/TourCard';

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [durations, setDurations] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/tours').then((d) => setTours(d.tours?.slice(0, 6) || [])).catch(() => {});
    api.get('/destinations').then((d) => setDestinations(d.destinations || [])).catch(() => {});
    api.get('/durations').then((d) => setDurations(d.durations || [])).catch(() => {});
    api.get('/reviews/admin/all').catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/70 via-forest-dark/60 to-forest-dark" />
        <Image
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000"
          alt="Northern Pakistan mountains"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="relative z-10 max-w-3xl px-4">
          <p className="uppercase tracking-[0.3em] text-sunset text-sm mb-4">Explore Nature, Discover Yourself</p>
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Explore the Wonders of<br />Northern Pakistan
          </h1>
          <p className="text-lg text-gray-200 mb-8">
            Handpicked adventures through mountains, valleys, and rivers — planned, priced, and booked in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tours" className="btn-sunset">Explore Tours</Link>
            <Link href="/tours" className="btn-outline">Book Your Adventure</Link>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sunset font-semibold uppercase text-xs tracking-widest mb-2">Featured Packages</p>
            <h2 className="font-heading text-3xl font-bold text-forest-dark">Popular Tour Packages</h2>
          </div>
          <Link href="/tours" className="text-forest font-semibold hover:underline hidden sm:block">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
          {tours.length === 0 && <p className="text-gray-500">Tours will appear here once added by the admin.</p>}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-white">
        <div className="section">
          <p className="text-sunset font-semibold uppercase text-xs tracking-widest mb-2">Where to go</p>
          <h2 className="font-heading text-3xl font-bold text-forest-dark mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {destinations.slice(0, 8).map((d) => (
              <Link key={d.id} href={`/destinations/${d.id}`} className="relative rounded-xl overflow-hidden h-40 group">
                {d.image_url ? (
                  <Image src={d.image_url} alt={d.title} fill className="object-cover group-hover:scale-105 transition" />
                ) : <div className="bg-forest h-full w-full" />}
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <span className="text-white font-semibold">{d.title}</span>
                </div>
              </Link>
            ))}
            {destinations.length === 0 && <p className="text-gray-500 col-span-4">Destinations will appear here once added.</p>}
          </div>
        </div>
      </section>

      {/* Durations */}
      <section className="section">
        <h2 className="font-heading text-3xl font-bold text-forest-dark mb-8 text-center">Available Tour Durations</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {durations.map((d) => (
            <span key={d.id} className="px-6 py-3 rounded-full bg-forest/10 text-forest font-semibold">
              {d.label || `${d.days} Days`}
            </span>
          ))}
          {durations.length === 0 && <p className="text-gray-500">1 / 2 / 3 / 6 / 8 Day tours — managed by admin.</p>}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-forest-dark text-white">
        <div className="section grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Trusted Local Guides', desc: 'Experienced guides who know the Northern Areas inside out.' },
            { title: 'Transparent Pricing', desc: 'No hidden charges — what you see is what you pay.' },
            { title: 'Guaranteed Seats', desc: 'Real-time seat availability with instant confirmation.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <h3 className="font-heading text-xl font-semibold mb-2 text-sunset">{f.title}</h3>
              <p className="text-gray-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="font-heading text-3xl font-bold text-forest-dark mb-10 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Choose a Tour', 'Select Pickup & Seat', 'Enter Details', 'Confirm Booking'].map((step, i) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 rounded-full bg-forest text-white font-bold flex items-center justify-center mx-auto mb-4">{i + 1}</div>
              <p className="font-semibold text-forest-dark">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sunset">
        <div className="section text-center">
          <h2 className="font-heading text-3xl font-bold text-forest-dark mb-4">Ready for your next adventure?</h2>
          <Link href="/tours" className="btn-primary inline-block">Browse All Tours</Link>
        </div>
      </section>
    </div>
  );
}
