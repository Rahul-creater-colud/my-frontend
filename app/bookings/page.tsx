'use client';
import { useEffect, useState } from 'react';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/lib/types';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import ChatBox from '@/components/ChatBox';
import { useToast } from '@/lib/useToast';
import { getUserFromToken, getToken } from '@/lib/auth';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  pending:   { label: 'Pending',   class: 'badge-pending',   icon: '⏳' },
  approved:  { label: 'Approved',  class: 'badge-approved',  icon: '✅' },
  ongoing:   { label: 'Ongoing',   class: 'badge-ongoing',   icon: '🚗' },
  completed: { label: 'Completed', class: 'badge-completed', icon: '✓' },
  rejected:  { label: 'Rejected',  class: 'badge-rejected',  icon: '✕' },
  cancelled: { label: 'Cancelled', class: 'badge-rejected',  icon: '✕' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState<string | null>(null);
  const { message, type, show } = useToast();

  const token = getToken();
  const me = token ? getUserFromToken(token) : null;

  useEffect(() => {
    bookingApi.mine()
      .then((res) => {
        const data = res?.data?.data || res?.data?.bookings || res?.data || [];
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => show('Could not load bookings', 'error'))
      .finally(() => setLoading(false));
  }, [show]);

  const cancelBooking = async (id: string) => {
    try {
      await bookingApi.cancel(id);
      show('Booking cancelled', 'success');
      setBookings(prev =>
        prev.map(x => x._id === id ? { ...x, status: 'cancelled' as any } : x)
      );
    } catch {
      show('Failed to cancel', 'error');
    }
  };

  const callPerson = (phone: string) => {
    window.open(`tel:+91${phone}`, '_self');
  };

  const whatsappPerson = (phone: string, vehicleName: string) => {
    const msg = encodeURIComponent(`Hi! I have a query about ${vehicleName} booking on RideNow.`);
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--muted)]">Loading your rides...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          My Rides
        </h1>
        <p className="text-sm text-[var(--muted)]">{bookings.length} booking(s) total</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🏍️</p>
          <p className="text-lg font-medium mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            No rides yet
          </p>
          <p className="text-sm text-[var(--muted)] mb-6">Book your first ride and hit the road!</p>
          <Link href="/" className="btn btn-primary">Explore Vehicles</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => {
            const status = statusConfig[b.status] || statusConfig.pending;
            const days = Math.max(1, Math.ceil(
              (new Date(b.end).getTime() - new Date(b.start).getTime()) / (1000 * 60 * 60 * 24)
            ));

            const ownerPhone = (b.owner as any)?.phone;
            const riderPhone = (b.rider as any)?.phone;
            const vehicleName = `${b.vehicle?.brand} ${b.vehicle?.model}`;
            const isRider = me?.role === 'rider';
            const contactPhone = isRider ? ownerPhone : riderPhone;
            const contactLabel = isRider ? 'Owner' : 'Rider';

            return (
              <div key={b._id} className="space-y-3">
                <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  style={{ animationDelay: `${i * 0.05}s` }}>

                  <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface2)]">
                    <img
                      src={b.vehicle?.images?.[0] || '/placeholder.jpg'}
                      alt={b.vehicle?.model}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                        {vehicleName}
                      </h3>
                      <span className={`badge ${status.class}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                      <span>
                        📅 {new Date(b.start).toLocaleDateString('en-IN')} →{' '}
                        {new Date(b.end).toLocaleDateString('en-IN')}
                      </span>
                      <span>🕐 {days} day(s)</span>
                      <span>📍 {b.pickupLocation}</span>
                    </div>

                    {contactPhone && b.status !== 'cancelled' && b.status !== 'rejected' && (
                      <div className="flex gap-2 pt-1 flex-wrap">
                        <button onClick={() => callPerson(contactPhone)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(0,184,255,0.15)', color: 'var(--accent2)', border: '1px solid rgba(0,184,255,0.3)' }}>
                          📞 Call {contactLabel}
                        </button>
                        <button onClick={() => whatsappPerson(contactPhone, vehicleName)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
                          💬 WhatsApp
                        </button>
                        <button onClick={() => setOpenChat(openChat === b._id ? null : b._id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={openChat === b._id
                            ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                          🗨️ {openChat === b._id ? 'Close Chat' : 'In-App Chat'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xl font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                        ₹{b.amount}
                      </p>
                      <p className="text-xs text-[var(--muted)]">total</p>
                    </div>
                    {(b.status === 'pending' || b.status === 'approved') && (
                      <button onClick={() => cancelBooking(b._id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(255,77,106,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,77,106,0.3)' }}>
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>

                {openChat === b._id && (
                  <ChatBox bookingId={b._id} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}