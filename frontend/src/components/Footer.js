import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="logo" width={40} height={40} className="rounded-full" />
            <span className="font-heading font-bold text-white">Craze Vibes Trips</span>
          </div>
          <p className="text-sm text-gray-400">Explore Nature, Discover Yourself. Tours across the breathtaking Northern Areas of Pakistan.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tours">Tours</Link></li>
            <li><Link href="/destinations">Destinations</Link></li>
            <li><Link href="/gallery">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cancellation-refund">Cancellation & Refund</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm">Northern Areas, Pakistan</p>
          <p className="text-sm mt-1">info@crazevibestrips.com</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Craze Vibes Trips. All rights reserved.</span>
        <Link href="/admin-login" className="hover:text-gray-300">Admin Login</Link>
      </div>
    </footer>
  );
}
