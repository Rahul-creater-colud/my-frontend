import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'RideNow — Bike & Car Rentals',
  description: 'Rent bikes and cars near you instantly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
        <Navbar />
        <main
          className="max-w-6xl mx-auto px-4 pb-20 pt-8"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}