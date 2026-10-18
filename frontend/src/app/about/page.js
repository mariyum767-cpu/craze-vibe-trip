'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AVATAR_COLORS = ['bg-forest', 'bg-sunset', 'bg-forest-dark'];

function avatarUrl(name = '') {
  // Clean, professional initials-style avatar (like Slack/GitHub defaults) —
  // deterministic per name, always renders, no cartoon illustration.
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1f4d3d,e8a13a,123328&fontFamily=Poppins&fontWeight=600`;
}

const STATS = [
  { value: '6+', label: 'Curated Destinations' },
  { value: '32', label: 'Seats per AC Coaster' },
  { value: '100%', label: 'Duplicate-Free Seat Booking' },
];

export default function AboutPage() {
  const [content, setContent] = useState(null);
  useEffect(() => { api.get('/site-content/about').then((d) => setContent(d.content?.content)).catch(() => {}); }, []);

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-64 sm:h-80 flex items-center justify-center text-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-forest-dark/70" />
        <div className="relative z-10 px-4">
          <p className="text-sunset uppercase tracking-widest text-xs sm:text-sm font-semibold mb-2">Who We Are</p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white">{content?.heading || 'About Craze Vibes Trips'}</h1>
        </div>
      </div>

      <div className="section max-w-5xl">
        {/* Split section: journey text + stats left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16 mt-12">
          <div>
            <p className="text-sunset uppercase tracking-widest text-xs sm:text-sm font-semibold mb-3">Our Journey</p>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
              {content?.intro || 'Craze Vibes Trips was founded to make the breathtaking Northern Areas of Pakistan accessible to everyone — from first-time travelers to seasoned trekkers. We handle the transport, stays, and logistics so you can just enjoy the journey.'}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="border border-gray-200 rounded-xl px-3 py-4 text-center sm:text-left">
                  <p className="font-heading text-2xl font-bold text-forest">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-72 sm:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
             src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1400"
              alt="Northern Pakistan mountains"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      {/* Mission / Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          <div className="flex items-start gap-4 bg-forest/5 rounded-xl p-6">
            <div className="w-12 h-12 shrink-0 rounded-full bg-forest text-white flex items-center justify-center text-xl">🎯</div>
            <div>
              <h3 className="font-heading font-semibold text-xl text-forest-dark mb-2">Our Mission</h3>
              <p className="text-base text-gray-600 leading-relaxed">{content?.mission || 'To make exploring Northern Pakistan safe, affordable, and unforgettable for every traveler — by handling every detail of transport, stays, and logistics with care, transparency, and a genuine love for the mountains, so you can focus on nothing but the journey.'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-sunset/5 rounded-xl p-6">
            <div className="w-12 h-12 shrink-0 rounded-full bg-sunset text-white flex items-center justify-center text-xl">🏔️</div>
            <div>
              <h3 className="font-heading font-semibold text-xl text-forest-dark mb-2">Our Vision</h3>
              <p className="text-base text-gray-600 leading-relaxed">{content?.vision || 'To become the most trusted travel companion for adventure seekers across Pakistan — building a community of explorers who return not just with photos, but with real connections to the land, the culture, and the people of the Northern Areas.'}</p>
            </div>
          </div>
        </div>
 
  {/* Team */}
        {content?.team?.length > 0 && (
          <div>
            <p className="text-sunset uppercase tracking-widest text-xs font-semibold text-center mb-2">The People Behind It</p>
            <h3 className="font-heading font-bold text-2xl text-forest-dark mb-8 text-center">Our Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {content.team.map((m, i) => (
                <div key={i} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                 
                  <p className="font-semibold text-sm text-forest-dark">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 