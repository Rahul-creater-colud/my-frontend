'use client';
import { VehicleType } from '@/lib/types';

export interface Filters {
  type?: VehicleType | '';
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function FiltersBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const typeOptions = [
    { value: '' as VehicleType | '', label: 'All', icon: '🚀' },
    { value: 'bike' as VehicleType, label: 'Bikes', icon: '🏍️' },
    { value: 'car' as VehicleType, label: 'Cars', icon: '🚗' },
  ];

  const fuelOptions = [
    { value: '', label: 'Any Fuel' }, { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' }, { value: 'electric', label: 'Electric' },
  ];

  const hasFilters = filters.type || filters.fuelType || filters.minPrice || filters.maxPrice;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex gap-2">
        {typeOptions.map((opt) => (
          <button key={opt.value} onClick={() => setFilters({ ...filters, type: opt.value })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={filters.type === opt.value
              ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span>{opt.icon}</span>{opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={filters.fuelType || ''} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
          className="input" style={{ width: 'auto', minWidth: '140px' }}>
          {fuelOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <input type="number" className="input" style={{ width: '100px' }} placeholder="Min ₹/day"
            value={filters.minPrice ?? ''} onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })} />
          <span className="text-[var(--muted)] text-sm">—</span>
          <input type="number" className="input" style={{ width: '100px' }} placeholder="Max ₹/day"
            value={filters.maxPrice ?? ''} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })} />
        </div>

        {hasFilters && (
          <button onClick={() => setFilters({ type: '', fuelType: '', minPrice: undefined, maxPrice: undefined })}
            className="text-sm text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}