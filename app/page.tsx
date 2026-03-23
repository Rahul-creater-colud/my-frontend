'use client';
import { useEffect, useState, useCallback } from 'react';
import FiltersBar, { Filters } from '@/components/FiltersBar';
import VehicleCard from '@/components/VehicleCard';
import Spinner from '@/components/Spinner';
import MapView from '@/components/MapView';
import Toast from '@/components/Toast';
import SearchBar from '@/components/SearchBar';
import { vehicleApi } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import { useToast } from '@/lib/useToast';
import { useGeo } from '@/lib/useGeo';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [nearby, setNearby] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<Filters>({ type: '', fuelType: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const { message, type, show } = useToast();
  const { coords, error: geoError } = useGeo();

  useEffect(() => {
    setLoading(true);
    vehicleApi.list({
      type: filters.type || undefined,
      fuelType: filters.fuelType || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    })
      .then((res) => {
        const data = res.data?.data || res.data;
        const arr = Array.isArray(data) ? data : [];
        setVehicles(arr);
        setFiltered(arr);
      })
      .catch(() => show('Failed to load vehicles', 'error'))
      .finally(() => setLoading(false));
  }, [filters, show]);

  // Search filter
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFiltered(vehicles);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      vehicles.filter(v =>
        v.brand?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.fuelType?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q)
      )
    );
  }, [vehicles]);

  useEffect(() => {
    if (!coords) return;
    vehicleApi.nearby(coords.lat, coords.lng, 10)
      .then((res) => {
        const data = res.data?.data || res.data;
        setNearby(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [coords]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="fade-up">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
          🏍️ Available near you
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Find your<br />
          <span style={{ color: 'var(--accent)' }}>next ride</span>
        </h1>
        <p className="text-[var(--muted)] text-base">
          Rent bikes & cars instantly. No paperwork, just go.
        </p>
      </div>

      {/* Search Bar */}
      <div className="fade-up-1">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Filters */}
      <div className="fade-up-1">
        <FiltersBar filters={filters} setFilters={setFilters} />
      </div>

      {/* Map */}
      {coords && (
        <div className="fade-up-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              📍 Vehicles near you ({nearby.length > 0 ? nearby.length : vehicles.length})
            </p>
            <button onClick={() => setShowMap((v) => !v)}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={showMap
                ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.2)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
            </button>
          </div>
          {showMap && <MapView center={coords} vehicles={nearby.length ? nearby : vehicles} />}
          {geoError && <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>⚠️ {geoError}</p>}
        </div>
      )}

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-[var(--muted)]">
          {filtered.length} result(s) for "<span style={{ color: 'var(--accent)' }}>{searchQuery}</span>"
        </p>
      )}

      {/* Vehicle Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--muted)]">Loading vehicles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[var(--muted)]">
            {searchQuery ? `"${searchQuery}" nahi mila` : 'No vehicles found. Try different filters.'}
          </p>
          {searchQuery && (
            <button onClick={() => handleSearch('')}
              className="mt-3 text-sm"
              style={{ color: 'var(--accent)' }}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="fade-up-3 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <div key={v._id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-up">
              <VehicleCard vehicle={v} />
            </div>
          ))}
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}