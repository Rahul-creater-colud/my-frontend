'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/lib/useToast';
import Toast from './Toast';
import Spinner from './Spinner';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  rider: { name?: string; phone: string };
}

export default function ReviewSection({ vehicleId }: { vehicleId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState('0');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { message, type, show } = useToast();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reviews/vehicle/${vehicleId}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.data || []);
        setAvgRating(data.avgRating || '0');
        setTotal(data.total || 0);
      })
      .catch(() => show('Could not load reviews', 'error'))
      .finally(() => setLoading(false));
  }, [vehicleId, show]);

  const stars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#FFB547' : 'var(--muted)', fontSize: '16px' }}>★</span>
    ));
  };

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <div className="card p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            {avgRating}
          </p>
          <div className="flex">{stars(Math.round(Number(avgRating)))}</div>
          <p className="text-xs text-[var(--muted)] mt-1">{total} review(s)</p>
        </div>
        <div className="flex-1">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const percent = total ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs w-4" style={{ color: 'var(--muted)' }}>{star}</span>
                <span style={{ color: '#FFB547', fontSize: '12px' }}>★</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, background: '#FFB547' }} />
                </div>
                <span className="text-xs w-4" style={{ color: 'var(--muted)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm text-[var(--muted)]">No reviews yet. Be the first!</p>
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r._id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {(r.rider?.name || r.rider?.phone)?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {r.rider?.name || `+91 ${r.rider?.phone?.slice(-4).padStart(10, '*')}`}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex">{stars(r.rating)}</div>
            </div>
            {r.comment && (
              <p className="text-sm text-[var(--muted)] pl-10">{r.comment}</p>
            )}
          </div>
        ))
      )}
      {message && <Toast message={message} type={type} />}
    </div>
  );
}