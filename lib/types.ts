export type VehicleType = 'bike' | 'car';
export type FuelType = 'petrol' | 'diesel' | 'electric';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
export type UserRole = 'rider' | 'owner' | 'admin';

export interface User {
  _id: string; phone: string; name?: string; role: UserRole; avatarUrl?: string; verified: boolean;
}

export interface Vehicle {
  _id: string; owner: string | User; brand: string; model: string;
  fuelType: FuelType; type: VehicleType; images: string[]; status: 'active' | 'inactive';
  price: { hour: number; day: number; week: number; };
  location: { type: 'Point'; coordinates: [number, number]; };
  locationCoords?: { lat: number; lng: number };
  rating?: number; reviewCount?: number; createdAt?: string;
}

export interface Booking {
  _id: string; vehicle: Vehicle; rider: User; owner: User;
  status: BookingStatus; start: string; end: string;
  durationType: 'hour' | 'day' | 'week'; pickupLocation: string;
  amount: number; deposit: number; paymentStatus?: 'pending' | 'paid' | 'refunded'; createdAt: string;
}