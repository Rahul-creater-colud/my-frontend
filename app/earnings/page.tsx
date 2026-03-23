'use client';
import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { useToast } from '@/lib/useToast';
import Toast from '@/components/Toast';
import { requireAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Summary {
  totalEarnings: number;
  totalBookings: number;
  completedBookings: number;
  ongoingBookings: number;
  monthly: Record<string, number>;
  perVehicle: { name: string; earnings: number; bookings: number }[];
}

interface Transaction {
  _id: string;
  vehicle: { brand: string; model: string; images: string[] };
  rider: { name?: string; phone: string };
  amount: number;
  status: string;
  createdAt: string;
}

const statusStyle: Record<string, { color: string; bg: string }> = {
  completed: { color: 'var(--accent)',   bg: 'var(--accent-dim)' },
  ongoing:   { color: 'var(--accent2)',  bg: 'rgba(0,184,255,0.15)' },
  approved:  { color: 'var(--warning)',  bg: 'rgba(255,181,71,0.15)' },
};

export default function EarningsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { message, type, show } = useToast();

  useEffect(() => {
    const user = requireAuth();
    if (!user) { router.push('/login'); return; }
    if (user.role === 'rider') { router.push('/'); return; }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;

    Promise.all([
      fetch(`${base}/api/v1/earnings/summary`, { headers }).then(r => r.json()),
      fetch(`${base}/api/v1/earnings/transactions`, { headers }).then(r => r.json()),
    ])
      .then(([s, t]) => {
        setSummary(s);
        setTransactions(t.data || []);
      })
      .catch(() => show('Could not load earnings', 'error'))
      .finally(() => setLoading(false));
  }, [router, show]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          💰 Earnings
        </h1>
        <p className="text-sm text-[var(--muted)]">Your revenue overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${summary?.totalEarnings || 0}`, icon: '💰', color: 'var(--accent)' },
          { label: 'Total Bookings', value: summary?.totalBookings || 0, icon: '📋', color: 'var(--accent2)' },
          { label: 'Completed', value: summary?.completedBookings || 0, icon: '✅', color: 'var(--accent)' },
          { label: 'Ongoing', value: summary?.ongoingBookings || 0, icon: '🚗', color: 'var(--warning)' },
        ].map((s) => (
          <div key={s.label} className="card p-4 space-y-2">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-[var(--muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      {summary?.monthly && Object.keys(summary.monthly).length > 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            📅 Monthly Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(summary.monthly)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([month, amount]) => {
                const max = Math.max(...Object.values(summary.monthly));
                const percent = max ? (amount / max) * 100 : 0;
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--muted)' }}>{month}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{amount}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Per Vehicle */}
      {summary?.perVehicle && summary.perVehicle.length > 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            🚗 Per Vehicle Earnings
          </h2>
          <div className="space-y-3">
            {summary.perVehicle
              .sort((a, b) => b.earnings - a.earnings)
              .map((v) => (
                <div key={v.name} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{v.name}</p>
                    <p className="text-xs text-[var(--muted)]">{v.bookings} booking(s)</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    ₹{v.earnings}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card p-5 space-y-4">
        <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          🧾 Recent Transactions
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm text-[var(--muted)]">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface2)]">
                  <img src={t.vehicle?.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {t.vehicle?.brand} {t.vehicle?.model}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Rider: {(t.rider as any)?.name || (t.rider as any)?.phone} •{' '}
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold"
                    style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    ₹{t.amount}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={statusStyle[t.status] || { color: 'var(--muted)', bg: 'transparent' }}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <Toast message={message} type={type} />}
    </div>
  );
}