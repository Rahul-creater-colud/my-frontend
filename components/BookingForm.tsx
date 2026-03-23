'use client';
import { useState } from 'react';
import { bookingApi, paymentApi } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import Spinner from './Spinner';

declare global { interface Window { Razorpay: any; } }

export default function BookingForm({
  vehicle,
  onSuccess,
}: {
  vehicle: Vehicle;
  onSuccess: () => void;
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [durationType, setDuration] = useState<'hour' | 'day' | 'week'>('day');
  const [pickupLocation, setPickup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const getEstimate = () => {
    if (durationType === 'hour') {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const hours = Math.max(1, (eh * 60 + em - sh * 60 - sm) / 60);
      return { duration: `${Math.ceil(hours)} hour(s)`, total: vehicle.price?.hour * Math.ceil(hours), rate: vehicle.price?.hour };
    }
    if (!start || !end) return null;
    const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
    if (durationType === 'week') {
      const weeks = Math.ceil(days / 7);
      return { duration: `${weeks} week(s)`, total: vehicle.price?.week * weeks, rate: vehicle.price?.week };
    }
    return { duration: `${days} day(s)`, total: vehicle.price?.day * days, rate: vehicle.price?.day };
  };

  const estimate = getEstimate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let startDate = start;
      let endDate = end;

      if (durationType === 'hour') {
        const todayStr = new Date().toISOString().split('T')[0];
        startDate = `${todayStr}T${startTime}:00`;
        endDate   = `${todayStr}T${endTime}:00`;
      }

      const bookingRes = await bookingApi.create({
        vehicleId: vehicle._id,
        start: startDate,
        end: endDate,
        durationType,
        pickupLocation,
      });

      const orderRes = await paymentApi.createOrder({
        bookingId: bookingRes.data.id,
        amount: estimate?.total || vehicle.price?.day,
      });

      if (orderRes.data.mock) {
        onSuccess();
        return;
      }

      const rzp = new window.Razorpay({
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        order_id: orderRes.data.orderId,
        name: 'RideNow',
        handler: async (response: any) => {
          await paymentApi.verify({
            bookingId: bookingRes.data.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onSuccess();
        },
        theme: { color: '#00E5A0' },
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Book this vehicle
      </h3>

      <div>
        <label className="label">Rental type</label>
        <div className="flex gap-2">
          {(['hour', 'day', 'week'] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDuration(d)}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={durationType === d
                ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {durationType === 'hour' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start time</label>
            <input type="time" value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input" />
          </div>
          <div>
            <label className="label">End time</label>
            <input type="time" value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input" />
          </div>
        </div>
      )}

      {durationType !== 'hour' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start date</label>
            <input type="date" required min={today} value={start}
              onChange={(e) => setStart(e.target.value)}
              className="input" />
          </div>
          <div>
            <label className="label">End date</label>
            <input type="date" required min={start || today} value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="input" />
          </div>
        </div>
      )}

      <div>
        <label className="label">Pickup location</label>
        <input required placeholder="Enter pickup address"
          value={pickupLocation}
          onChange={(e) => setPickup(e.target.value)}
          className="input" />
      </div>

      {estimate && (
        <div className="rounded-xl p-3 space-y-1"
          style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--muted)' }}>Rate</span>
            <span style={{ color: 'var(--accent)' }}>₹{estimate.rate}/{durationType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--muted)' }}>Duration</span>
            <span style={{ color: 'var(--text)' }}>{estimate.duration}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-white/10">
            <span style={{ color: 'var(--text)' }}>Total estimate</span>
            <span style={{ color: 'var(--accent)' }}>₹{estimate.total}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm rounded-lg px-3 py-2"
          style={{ color: 'var(--danger)', background: 'rgba(255,77,106,0.1)' }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? <Spinner /> : '💳 Book & Pay Now'}
      </button>
    </form>
  );
}