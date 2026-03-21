export type VehicleType = 'bike' | 'car';

export interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  fuelType: string;
  price: number;
  type?: VehicleType; // ✅ FIX

  images?: string[];

  // ✅ handle both cases
  location?: 
    | string
    | {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
      };

  pricing?: {
    hour?: number;
    day?: number;
    week?: number;
  };

  locationCoords?: {
    lat: number;
    lng: number;
  };

  status?: 'active' | 'inactive';
}

export interface Booking {
  _id: string;

  vehicle: Vehicle;

  status: 'pending' | 'approved' | 'ongoing' | 'completed';

  start: string;
  end: string;

  durationType: 'hour' | 'day' | 'week';
  pickupLocation: string;

  amount?: number;
  deposit?: number;
}