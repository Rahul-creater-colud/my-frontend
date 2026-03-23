'use client';
import { useState } from 'react';
import Spinner from './Spinner';

interface Suggestion {
  suggested: { hour: number; day: number; week: number };
  marketData?: { avgDay: number; minDay: number; maxDay: number; sampleSize: number };
  message: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function AIPriceSuggester({
  vehicleType,
  fuelType,
  lat,
  lng,
  onApply,
}: {
  vehicleType: string;
  fuelType: string;
  lat: string;
  lng: string;
  onApply: (prices: { hour: string; day: string; week: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState('');

  const confidenceColor = {
    high:   'var(--accent)',
    medium: 'var(--warning)',
    low:    'var(--muted)',
  };

  const getSuggestion = async () => {
    if (!lat || !lng) { setError('Please enter coordinates first'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/ai/price-suggest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type:     vehicleType,
            brand:    'generic',
            fuelType,
            lat:      Number(lat),
            lng:      Number(lng),
          }),
        }
      );
      const data = await res.json();
      setSuggestion(data);
    } catch { setError('Could not get suggestions'); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.2)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            AI Price Suggester
          </p>
        </div>
        <button
          type="button"
          onClick={getSuggestion}
          disabled={loading}
          className="btn btn-primary text-xs py-1.5 px-3">
          {loading ? <Spinner /> : '✨ Get Suggestion'}
        </button>
      </div>

      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

      {suggestion && (
        <div className="space-y-3">
          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
              style={{
                background: `${confidenceColor[suggestion.confidence]}22`,
                color: confidenceColor[suggestion.confidence],
                border: `1px solid ${confidenceColor[suggestion.confidence]}44`,
              }}>
              {suggestion.confidence === 'high' ? '🎯' : suggestion.confidence === 'medium' ? '📊' : '💡'} {suggestion.confidence} confidence
            </span>
            <p className="text-xs text-[var(--muted)]">{suggestion.message}</p>
          </div>

          {/* Market Data */}
          {suggestion.marketData && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs text-[var(--muted)]">Min/day</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{suggestion.marketData.minDay}</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs text-[var(--muted)]">Avg/day</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{suggestion.marketData.avgDay}</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs text-[var(--muted)]">Max/day</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{suggestion.marketData.maxDay}</p>
              </div>
            </div>
          )}

          {/* Suggested Prices */}
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              💡 Suggested competitive prices:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Per Hour', val: suggestion.suggested.hour },
                { label: 'Per Day',  val: suggestion.suggested.day },
                { label: 'Per Week', val: suggestion.suggested.week },
              ].map((p) => (
                <div key={p.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.3)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    ₹{p.val}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApply({
              hour: String(suggestion.suggested.hour),
              day:  String(suggestion.suggested.day),
              week: String(suggestion.suggested.week),
            })}
            className="btn btn-primary w-full text-sm">
            ✅ Apply These Prices
          </button>
        </div>
      )}
    </div>
  );
}