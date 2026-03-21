'use client';
import { useEffect, useState } from 'react';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/lib/types';
import Spinner from '@/components/Spinner';
import { useToast } from '@/lib/useToast';
import Toast from '@/components/Toast';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-200',
  approved: 'bg-blue-500/20 text-blue-200',
  ongoing: 'bg-emerald-500/20 text-emerald-200',
  completed: 'bg-gray-500/20 text-gray-200'
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { message, type, show } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.mine();

        // ✅ SAFE DATA EXTRACTION
        const data = res?.data?.data || res?.data?.bookings || [];

        setBookings(Array.isArray(data) ? data : []);
      } catch {
        show('Could not load bookings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [show]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Bookings</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-3">

          {Array.isArray(bookings) && bookings.map(b => (
            <div
              key={b._id}
              className="card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="text-lg font-semibold">
                  {b.vehicle?.brand} {b.vehicle?.model}
                </p>

                {/* ✅ FIXED HERE */}
                <p className="text-gray-400 text-sm">
                  {new Date(b.start).toLocaleDateString()} → {new Date(b.end).toLocaleDateString()}
                </p>

                <p className="text-gray-400 text-sm">
                  Pickup: {b.pickupLocation}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm capitalize ${statusColors[b.status]}`}
              >
                {b.status}
              </span>
            </div>
          ))}

          {!bookings.length && (
            <p className="text-gray-400">No bookings yet.</p>
          )}
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}