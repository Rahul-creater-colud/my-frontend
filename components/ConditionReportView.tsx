'use client';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

interface Report {
  _id: string;
  reportType: 'pickup' | 'return';
  photos: string[];
  fuelLevel: string;
  odometer?: number;
  condition: string;
  damages: { part: string; description: string; photo?: string }[];
  notes?: string;
  createdBy: { name?: string; phone: string; role: string };
  createdAt: string;
}

const conditionColor: Record<string, string> = {
  excellent: 'var(--accent)',
  good:      'var(--accent2)',
  fair:      'var(--warning)',
  poor:      'var(--danger)',
};

const fuelLabel: Record<string, string> = {
  empty:          '▱▱▱▱ Empty',
  quarter:        '▰▱▱▱ Quarter',
  half:           '▰▰▱▱ Half',
  three_quarter:  '▰▰▰▱ Three Quarter',
  full:           '▰▰▰▰ Full',
};

export default function ConditionReportView({ bookingId }: { bookingId: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/condition-reports/booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setReports(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;
  if (reports.length === 0) return (
    <p className="text-sm text-center text-[var(--muted)] py-4">No condition reports yet</p>
  );

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r._id} className="card p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{r.reportType === 'pickup' ? '🚗' : '🏁'}</span>
              <div>
                <p className="text-sm font-semibold capitalize"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {r.reportType} Report
                </p>
                <p className="text-xs text-[var(--muted)]">
                  By {r.createdBy?.name || r.createdBy?.phone} •{' '}
                  {new Date(r.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold capitalize"
              style={{ color: conditionColor[r.condition] }}>
              {r.condition}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-[var(--muted)]">⛽ Fuel Level</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text)' }}>
                {fuelLabel[r.fuelLevel] || r.fuelLevel}
              </p>
            </div>
            {r.odometer && (
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <p className="text-xs text-[var(--muted)]">🔢 Odometer</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text)' }}>
                  {r.odometer} km
                </p>
              </div>
            )}
          </div>

          {/* Photos */}
          {r.photos && r.photos.length > 0 && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">📸 Photos</p>
              <div className="flex gap-2 flex-wrap">
                {r.photos.map((p, i) => (
                  <a key={i} href={p} target="_blank" rel="noopener noreferrer">
                    <img src={p} className="w-20 h-20 rounded-xl object-cover hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Damages */}
          {r.damages && r.damages.length > 0 && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">⚠️ Damages</p>
              <div className="space-y-2">
                {r.damages.map((d, i) => (
                  <div key={i} className="rounded-xl p-3 text-sm"
                    style={{ background: 'rgba(255,77,106,0.07)', border: '1px solid rgba(255,77,106,0.2)' }}>
                    <p className="font-medium" style={{ color: 'var(--danger)' }}>{d.part}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {r.notes && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">📝 Notes</p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{r.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}