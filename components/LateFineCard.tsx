'use client';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

interface Fine {
  _id: string;
  lateHours: number;
  ratePerHour: number;
  fineAmount: number;
  status: 'pending' | 'paid' | 'waived';
  scheduledEnd: string;
  actualReturn: string;
  vehicle: { brand: string; model: string; images: string[] };
}

export default function LateFineCard({ bookingId }: { bookingId: string }) {
  const [fine, setFine] = useState<Fine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/late-fines/booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setFine(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Spinner />;
  if (!fine) return null;

  const statusStyle = {
    pending: { bg: 'rgba(255,77,106,0.1)',  color: 'var(--danger)',  label: '⏳ Pending' },
    paid:    { bg: 'var(--accent-dim)',      color: 'var(--accent)',  label: '✅ Paid' },
    waived:  { bg: 'rgba(0,184,255,0.1)',   color: 'var(--accent2)', label: '🎉 Waived' },
  };

  const s = statusStyle[fine.status];

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(255,77,106,0.07)', border: '1px solid rgba(255,77,106,0.2)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>
            Late Return Fine
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: '📅 Scheduled Return', val: new Date(fine.scheduledEnd).toLocaleString('en-IN') },
          { label: '🕐 Actual Return',    val: new Date(fine.actualReturn).toLocaleString('en-IN') },
          { label: '⏱️ Late by',          val: `${fine.lateHours} hour(s)` },
          { label: '💰 Rate',             val: `₹${fine.ratePerHour}/hr (1.5x)` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg p-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--muted)' }}>{item.label}</p>
            <p className="font-medium mt-0.5" style={{ color: 'var(--text)' }}>{item.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl"
        style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.2)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Total Fine</p>
        <p className="text-xl font-bold" style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
          ₹{fine.fineAmount}
        </p>
      </div>
    </div>
  );
}