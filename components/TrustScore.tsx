'use client';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

interface ScoreData {
  score: number;
  badge: string;
  color: string;
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    avgRating: string | null;
    reviewCount: number;
  };
}

export default function TrustScore({ userId }: { userId: string }) {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/${userId}/score`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex justify-center py-3"><Spinner /></div>;
  if (!data) return null;

  const circumference = 2 * Math.PI * 36;
  const strokeDash = (data.score / 100) * circumference;

  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        🛡️ Trust Score
      </h3>

      {/* Score Circle */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="36" fill="none"
              stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle cx="48" cy="48" r="36" fill="none"
              stroke={data.color} strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: data.color }}>
              {data.score}
            </p>
            <p className="text-[9px] text-[var(--muted)]">/ 100</p>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <p className="text-base font-semibold">{data.badge}</p>
          <div className="space-y-1">
            {[
              { label: 'Total Rides',     val: data.stats.totalBookings },
              { label: 'Completed',       val: data.stats.completedBookings },
              { label: 'Cancelled',       val: data.stats.cancelledBookings },
              { label: 'Avg Rating',      val: data.stats.avgRating ? `${data.stats.avgRating}⭐` : 'N/A' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--muted)' }}>Poor</span>
          <span style={{ color: 'var(--muted)' }}>Elite</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${data.score}%`,
              background: `linear-gradient(to right, var(--danger), var(--warning), var(--accent))`,
            }} />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--muted)]">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>
    </div>
  );
}