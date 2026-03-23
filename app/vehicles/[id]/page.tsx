'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { vehicleApi } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import Spinner from '@/components/Spinner';
import BookingForm from '@/components/BookingForm';
import Toast from '@/components/Toast';
import ReviewSection from '@/components/Reviewsection';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { useToast } from '@/lib/useToast';

export default function VehicleDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { message, type, show } = useToast();

  useEffect(() => {
    if (!id) return;
    vehicleApi.detail(id)
      .then((res) => setVehicle(res.data?.data || res.data))
      .catch(() => show('Failed to load vehicle', 'error'))
      .finally(() => setLoading(false));
  }, [id, show]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!vehicle) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">🔍</p>
      <p className="text-[var(--muted)]">Vehicle not found.</p>
    </div>
  );

  const coords = vehicle.location?.coordinates;
  const fuelIcon = vehicle.fuelType === 'electric' ? '⚡' : vehicle.fuelType === 'diesel' ? '🛢️' : '⛽';

  return (
    <div className="space-y-6 fade-up">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div className="card rounded-2xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <img src={vehicle.images?.[activeImg] || '/placeholder.jpg'} alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover" />
          </div>

          {vehicle.images && vehicle.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {vehicle.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                  style={{ border: i === activeImg ? '2px solid var(--accent)' : '2px solid transparent', opacity: i === activeImg ? 1 : 0.6 }}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--muted)] capitalize mb-1">{vehicle.type}</p>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {vehicle.brand} {vehicle.model}
                </h1>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                style={vehicle.status === 'active'
                  ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.2)' }
                  : { background: 'rgba(255,77,106,0.1)', color: 'var(--danger)' }}>
                {vehicle.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: fuelIcon, label: 'Fuel', val: vehicle.fuelType },
                { icon: '🚘', label: 'Type', val: vehicle.type },
                { icon: '📍', label: 'Location', val: coords ? `${coords[1].toFixed(3)}, ${coords[0].toFixed(3)}` : 'N/A' },
                { icon: '✅', label: 'Status', val: vehicle.status },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 space-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <p className="text-xs text-[var(--muted)]">{s.icon} {s.label}</p>
                  <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>{s.val}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="label mb-2">Pricing</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Per Hour', val: vehicle.price?.hour },
                  { label: 'Per Day',  val: vehicle.price?.day },
                  { label: 'Per Week', val: vehicle.price?.week },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl p-3 text-center"
                    style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.15)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>₹{p.val}</p>
                    <p className="text-xs text-[var(--muted)]">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <AvailabilityCalendar vehicleId={vehicle._id} />
        </div>

        <div className="lg:sticky lg:top-24">
          <BookingForm vehicle={vehicle} onSuccess={() => show('Booking created! 🎉', 'success')} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          ⭐ Reviews
        </h2>
        <ReviewSection vehicleId={vehicle._id} />
      </div>

      {message && <Toast message={message} type={type} />}
    </div>
  );
}