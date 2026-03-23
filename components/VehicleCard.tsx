'use client';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const price = vehicle.price?.day ?? 0;
  const coords = vehicle.location?.coordinates;
  const locationStr = coords ? `${coords[1].toFixed(2)}, ${coords[0].toFixed(2)}` : 'Location N/A';
  const fuelIcon = vehicle.fuelType === 'electric' ? '⚡' : vehicle.fuelType === 'diesel' ? '🛢️' : '⛽';
  const typeIcon = vehicle.type === 'bike' ? '🏍️' : '🚗';

  return (
    <div className="card group flex flex-col gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <div className="relative h-48 overflow-hidden bg-[var(--surface2)]">
        <img src={vehicle.images?.[0] || '/placeholder.jpg'} alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm border border-white/10">
          {typeIcon} {vehicle.type}
        </div>
        {vehicle.status === 'inactive' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sm font-medium text-white/70">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[var(--muted)] capitalize mb-0.5">{vehicle.brand}</p>
            <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              {vehicle.model}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>₹{price}</p>
            <p className="text-xs text-[var(--muted)]">per day</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span>{fuelIcon} {vehicle.fuelType}</span>
          <span className="w-px h-3 bg-white/10" />
          <span>📍 {locationStr}</span>
        </div>

        <div className="flex gap-2">
          {[{ label: '/hr', val: vehicle.price?.hour }, { label: '/day', val: vehicle.price?.day }, { label: '/wk', val: vehicle.price?.week }].map((p) => (
            <div key={p.label} className="flex-1 bg-white/[0.04] rounded-lg px-2 py-1.5 text-center border border-white/[0.05]">
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>₹{p.val}</p>
              <p className="text-[10px] text-[var(--muted)]">{p.label}</p>
            </div>
          ))}
        </div>

        <Link href={`/vehicles/${vehicle._id}`} className="btn btn-primary w-full text-sm py-2.5"
          style={vehicle.status === 'inactive' ? { pointerEvents: 'none', opacity: 0.4 } : {}}>
          View & Book →
        </Link>
      </div>
    </div>
  );
}