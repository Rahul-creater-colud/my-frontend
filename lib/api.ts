import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// 🔐 Attach token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  sendOtp: (data: { phone: string }) =>
    api.post('/api/v1/auth/send-otp', data),

  verifyOtp: (data: { phone: string; code: string }) =>
    api.post('/api/v1/auth/verify-otp', data),
};
// 🚗 VEHICLES
export const vehicleApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get('/vehicles', { params }),

  detail: (id: string) =>
    api.get(`/vehicles/${id}`),

  create: (data: any) =>
    api.post('/vehicles', data),

  nearby: (lat: number, lng: number, radiusKm = 10) =>
    api.get('/vehicles', {
      params: { lat, lng, radius: radiusKm * 1000 },
    }),
};

// 📦 BOOKINGS
export const bookingApi = {
  create: (data: any) =>
    api.post('/bookings', data),

  mine: () =>
    api.get('/bookings'),
};