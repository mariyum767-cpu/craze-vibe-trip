'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/tours', label: 'Tours' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-forest-dark/95 backdrop-blur text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Craze Vibes Trips" width={48} height={48} className="rounded-full" />
          <span className="font-heading font-bold text-lg hidden sm:block">Craze Vibes Trips</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-sunset transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm hover:text-sunset">
                {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
              <button onClick={logout} className="btn-sunset !py-2 !px-5 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-sunset">Login</Link>
              <Link href="/register" className="btn-sunset !py-2 !px-5 text-sm">Register</Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h20M4 14h20M4 21h20" /></svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-forest-dark border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)}>
                {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-sunset">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
