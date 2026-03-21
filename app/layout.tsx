import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Script from 'next/script';
// inside <body> before <main>
<Script
  src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
  strategy="afterInteractive"
/>
export const metadata: Metadata = { title: 'RideNow', description: 'Bike & Car rentals' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pb-16 pt-8">{children}</main>
      </body>
    </html>
  );
}
