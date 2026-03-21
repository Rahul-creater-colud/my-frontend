'use client';

import { useEffect, useState } from 'react';
import FiltersBar, { Filters } from '@/components/FiltersBar';
import VehicleCard from '@/components/VehicleCard';
import Spinner from '@/components/Spinner';
import MapView from '@/components/MapView';

import { vehicleApi } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import { useToast } from '@/lib/useToast';
import { useGeo } from '@/lib/useGeo';

import Toast from '@/components/Toast';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nearby, setNearby] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    type: '',
    fuelType: ''
  });

  const { message, type, show } = useToast();
  const { coords, error: geoError } = useGeo();

  // 🔹 ALL VEHICLES
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleApi.list({
          type: filters.type || undefined,
          fuelType: filters.fuelType || undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice
        });

        const data = res.data.data || res.data;
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        show('Failed to load vehicles', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters, show]);

  // 🔹 NEARBY VEHICLES
  useEffect(() => {
    if (!coords) return;

    vehicleApi
      .nearby(coords.lat, coords.lng, 10)
      .then((res) => {
        const data = res.data.data || res.data;
        setNearby(Array.isArray(data) ? data : []);
      })
      .catch(() => show('Failed to load nearby vehicles', 'error'));
  }, [coords, show]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find your next ride</h1>

      <FiltersBar filters={filters} setFilters={setFilters} />

      {/* 📍 MAP SECTION */}
      {coords && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              Nearby vehicles (within ~10 km)
            </p>
            {geoError && (
              <span className="text-sm text-rose-300">
                {geoError}
              </span>
            )}
          </div>

          <MapView
            center={coords}
            vehicles={nearby.length ? nearby : vehicles}
          />
        </div>
      )}

      {/* 🚗 VEHICLE LIST */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}

          {!vehicles.length && (
            <p className="text-gray-400">No vehicles found.</p>
          )}
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}