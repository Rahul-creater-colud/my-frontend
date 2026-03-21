'use client';
import { useState } from 'react';
import { bookingApi } from '@/lib/api';
import Spinner from './Spinner';

export default function BookingForm({ vehicleId, onSuccess }: { vehicleId: string; onSuccess: () => void }) {
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState('');
  const [durationType, setDuration] = useState<'hour' | 'day' | 'week'>('day');
  const [pickupLocation, setPickup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await bookingApi.create({ vehicleId, startDate, endDate, durationType, pickupLocation });
      onSuccess();
      setStart(''); setEnd(''); setPickup('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="card rounded-xl p-4 space-y-3">
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="text-sm text-gray-400">Start</label>
          <input type="date" required value={startDate} onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-400">End</label>
          <input type="date" required value={endDate} onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
        </div>
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="text-sm text-gray-400">Duration</label>
          <select value={durationType} onChange={(e) => setDuration(e.target.value as any)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-2">
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-400">Pickup Location</label>
          <input required value={pickupLocation} onChange={(e) => setPickup(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-2" />
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-60">
        {loading && <Spinner />} Book Now
      </button>
    </form>
  );
}
