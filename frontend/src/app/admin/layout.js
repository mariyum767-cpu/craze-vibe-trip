'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/tours', label: 'Tours' },
  { href: '/admin/durations', label: 'Durations' },
  { href: '/admin/destinations', label: 'Destinations' },
  { href: '/admin/pickup-points', label: 'Pickup Points' },
  { href: '/admin/vehicles', label: 'Vehicles / Coasters' },
  { href: '/admin/seats', label: 'Seats' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/content', label: 'Website Content' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-1">
          <nav className="card p-3 space-y-1 sticky top-24">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${pathname === n.href ? 'bg-forest text-white' : 'text-gray-700 hover:bg-forest/10'}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-4">{children}</div>
      </div>
    </AdminGuard>
  );
}
