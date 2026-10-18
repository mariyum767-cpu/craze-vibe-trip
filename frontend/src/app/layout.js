import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Craze Vibes Trips | Explore Northern Pakistan',
  description: 'Discover and book tours to the breathtaking Northern Areas of Pakistan with Craze Vibes Trips.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
