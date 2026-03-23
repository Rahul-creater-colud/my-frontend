'use client';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

interface Props {
  vehicleId: string;
  isOwner?: boolean;
  onDateSelect?: (date: string) => void;
  selectedDates?: string[];
}

export default function AvailabilityCalendar({
  vehicleId,
  isOwner = false,
  onDateSelect,
  selectedDates = [],
}: Props) {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [ownerBlocked, setOwnerBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/availability/${vehicleId}`)
      .then(r => r.json())
      .then(data => {
        setBlockedDates(data.unavailableDates || []);
        setBookedDates(data.bookedDates || []);
        setOwnerBlocked(data.blockedDates || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const saveBlockedDates = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/availability/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockedDates: ownerBlocked }),
      });
    } catch {}
    finally { setSaving(false); }
  };

  const toggleOwnerBlock = (date: string) => {
    if (!isOwner) return;
    if (bookedDates.includes(date)) return; // Already booked
    setOwnerBlocked(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();
    const days  = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDateStatus = (dateStr: string) => {
    if (bookedDates.includes(dateStr)) return 'booked';
    if (ownerBlocked.includes(dateStr)) return 'blocked';
    if (selectedDates.includes(dateStr)) return 'selected';
    return 'available';
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          📅 Availability
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
            style={{ color: 'var(--muted)' }}>
            ←
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text)', minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
            style={{ color: 'var(--muted)' }}>
            →
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-medium py-1"
            style={{ color: 'var(--muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day     = i + 1;
          const dateStr = formatDate(year, month, day);
          const status  = getDateStatus(dateStr);
          const isPast  = dateStr < today;

          return (
            <button
              key={day}
              onClick={() => {
                if (isPast) return;
                if (isOwner) toggleOwnerBlock(dateStr);
                else if (onDateSelect && status === 'available') onDateSelect(dateStr);
              }}
              disabled={isPast || (!isOwner && status === 'booked') || (!isOwner && status === 'blocked')}
              className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
              style={{
                ...(isPast ? {
                  color: 'var(--muted)',
                  opacity: 0.3,
                  cursor: 'not-allowed',
                } : status === 'booked' ? {
                  background: 'rgba(255,77,106,0.2)',
                  color: 'var(--danger)',
                  cursor: 'not-allowed',
                } : status === 'blocked' ? {
                  background: 'rgba(255,181,71,0.2)',
                  color: 'var(--warning)',
                  cursor: isOwner ? 'pointer' : 'not-allowed',
                } : status === 'selected' ? {
                  background: 'var(--accent)',
                  color: '#080C14',
                } : dateStr === today ? {
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(0,229,160,0.4)',
                } : {
                  color: 'var(--text)',
                  cursor: isOwner ? 'pointer' : 'default',
                }),
              }}>
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,77,106,0.2)' }} />
          <span style={{ color: 'var(--muted)' }}>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,181,71,0.2)' }} />
          <span style={{ color: 'var(--muted)' }}>Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-dim)' }} />
          <span style={{ color: 'var(--muted)' }}>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'var(--muted)' }}>Available</span>
        </div>
      </div>

      {/* Owner Save Button */}
      {isOwner && (
        <button
          onClick={saveBlockedDates}
          disabled={saving}
          className="btn btn-primary w-full text-sm">
          {saving ? <Spinner /> : '💾 Save Blocked Dates'}
        </button>
      )}
    </div>
  );
}