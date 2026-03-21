'use client';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="card rounded-xl p-4 flex flex-col gap-3">
      <img
        src={vehicle.images?.[0] || '/placeholder.jpg'}
        alt={vehicle.model}
        className="h-44 w-full object-cover rounded-lg"
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 capitalize">{vehicle.type}</p>
          <h3 className="text-lg font-semibold">{vehicle.brand} {vehicle.model}</h3>
        </div>
        <span className="text-emerald-400 font-semibold">${vehicle.price}/day</span>
      </div>
      <div className="text-sm text-gray-400 flex justify-between">
        <span>{vehicle.fuelType}</span>
        <span>
  {
    typeof vehicle.location === "string"
      ? vehicle.location
      : vehicle.location && vehicle.location.coordinates
        ? vehicle.location.coordinates[1] + ", " + vehicle.location.coordinates[0]
        : "Any location"
  }
</span>
      </div>
      <Link
        href={`/vehicles/${vehicle._id}`}
        className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded bg-emerald-500 text-black font-medium hover:bg-emerald-400">
        View & Book
      </Link>
    </div>
  );
}
