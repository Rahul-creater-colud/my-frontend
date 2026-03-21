'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { vehicleApi } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import Spinner from '@/components/Spinner';
import BookingForm from '@/components/BookingForm';
import { useToast } from '@/lib/useToast';
import Toast from '@/components/Toast';

export default function VehicleDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // ✅ FIX

  const [vehicle, setVehicle] = useState<Vehicle | null>(null); // ✅ FIX
  const [loading, setLoading] = useState(true);
  const { message, type, show } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        const res = await vehicleApi.detail(id);
        setVehicle(res.data.data || res.data);
      } catch {
        show('Failed to load vehicle', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, show]);

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!vehicle) return <p>Vehicle not found.</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="card rounded-xl p-4 space-y-3">
        <img
          src={vehicle.images?.[0] || '/placeholder.jpg'}
          alt={vehicle.model}
          className="w-full h-72 object-cover rounded-lg"
        />

        <h2 className="text-2xl font-bold">
          {vehicle.brand} {vehicle.model}
        </h2>

        <p className="text-gray-300">
          Fuel: {vehicle.fuelType} • Location: {
            typeof vehicle.location === "string"
              ? vehicle.location
              : vehicle.location?.coordinates
                ? `${vehicle.location.coordinates[1]}, ${vehicle.location.coordinates[0]}`
                : "Any"
          }
        </p>

        <div className="flex gap-4">
          <div className="card px-3 py-2 rounded bg-white/5">
            Hour: ${vehicle.pricing?.hour ?? vehicle.price}
          </div>
          <div className="card px-3 py-2 rounded bg-white/5">
            Day: ${vehicle.pricing?.day ?? vehicle.price}
          </div>
          <div className="card px-3 py-2 rounded bg-white/5">
            Week: ${vehicle.pricing?.week ?? vehicle.price * 5}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <BookingForm
          vehicleId={vehicle._id}
          onSuccess={() => show('Booking created', 'success')}
        />
      </div>

      {message && <Toast message={message} type={type} />}
    </div>
  );
}