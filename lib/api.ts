import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (data: { phone: string }) => api.post('/api/v1/auth/send-otp', data),
  verifyOtp: (data: { phone: string; code: string }) => api.post('/api/v1/auth/verify-otp', data),
};

export const vehicleApi = {
  list: (params?: { type?: string; fuelType?: string; minPrice?: number; maxPrice?: number }) =>
    api.get('/api/v1/vehicles', { params }),
  detail: (id: string) => api.get(`/api/v1/vehicles/${id}`),
  create: (data: any) => api.post('/api/v1/vehicles', data),
  nearby: (lat: number, lng: number, radiusKm = 10) =>
    api.get('/api/v1/vehicles/nearby', { params: { lat, lng, radius: radiusKm * 1000 } }),
  myVehicles: () => api.get('/api/v1/vehicles/mine'),
  update: (id: string, data: any) => api.patch(`/api/v1/vehicles/${id}`, data),
  uploadImage: async (file: File): Promise<string> => {
    const { data } = await api.post('/api/v1/upload/sign');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', data.apiKey);
    formData.append('timestamp', data.timestamp);
    formData.append('signature', data.signature);
    formData.append('folder', data.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!json.secure_url) throw new Error('Upload failed');
    return json.secure_url;
  },
};

export const bookingApi = {
  create: (data: { vehicleId: string; start: string; end: string; durationType: 'hour' | 'day' | 'week'; pickupLocation: string }) =>
    api.post('/api/v1/bookings', data),
  mine: () => api.get('/api/v1/bookings/mine'),
  ownerBookings: () => api.get('/api/v1/bookings/owner'),
  updateStatus: (id: string, status: 'approved' | 'rejected') =>
    api.patch(`/api/v1/bookings/${id}/status`, { status }),
  startRide: (id: string) => api.post(`/api/v1/bookings/${id}/start`),
  endRide: (id: string) => api.post(`/api/v1/bookings/${id}/end`),
  cancel: (id: string) => api.patch(`/api/v1/bookings/${id}/cancel`),
};

export const paymentApi = {
  createOrder: (data: { bookingId: string; amount: number }) =>
    api.post('/api/v1/payments/order', data),
  verify: (data: { bookingId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    api.post('/api/v1/payments/verify', data),
};

export const userApi = {
  profile: () => api.get('/api/v1/users/me'),
  updateProfile: (data: { name?: string; avatarUrl?: string }) => api.patch('/api/v1/users/me', data),
};export const messageApi = {
  getMessages: (bookingId: string) =>
    api.get(`/api/v1/messages/${bookingId}`),
  sendMessage: (bookingId: string, text: string) =>
    api.post(`/api/v1/messages/${bookingId}`, { text }),
  unreadCount: () =>
    api.get('/api/v1/messages/unread/count'),
};