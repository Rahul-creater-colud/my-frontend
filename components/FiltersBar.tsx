'use client';
import { VehicleType } from '@/lib/types';

export interface Filters {
  type?: VehicleType | '';
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function FiltersBar({ filters, setFilters }:
  { filters: Filters; setFilters: (f: Filters) => void }) {

  return (
    <div className="card rounded-xl p-4 flex flex-wrap gap-4 items-end">
      <div>
        <label className="text-sm text-gray-400">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as VehicleType | '' })}
          className="mt-1 bg-white/5 border border-white/10 rounded px-3 py-2">
          <option value="">All</option>
          <option value="bike">Bike</option>
          <option value="car">Car</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-400">Fuel</label>
        <select
          value={filters.fuelType || ''}
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
          className="mt-1 bg-white/5 border border-white/10 rounded px-3 py-2">
          <option value="">Any</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
        </select>
      </div>
      <div className="flex gap-2">
        <div>
          <label className="text-sm text-gray-400">Min $/day</label>
          <input type="number" className="mt-1 w-28 bg-white/5 border border-white/10 rounded px-3 py-2"
            value={filters.minPrice ?? ''} onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Max $/day</label>
          <input type="number" className="mt-1 w-28 bg-white/5 border border-white/10 rounded px-3 py-2"
            value={filters.maxPrice ?? ''} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })} />
        </div>
      </div>
      <button
        onClick={() => setFilters({ type: '', fuelType: '', minPrice: undefined, maxPrice: undefined })}
        className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">
        Clear
      </button>
    </div>
  );
}
