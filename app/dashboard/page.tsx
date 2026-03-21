'use client';

import { useState } from 'react';
import { vehicleApi } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { useToast } from '@/lib/useToast';
import Toast from '@/components/Toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const { message, type, show } = useToast();

  const [form, setForm] = useState({
    type: 'car',
    brand: '',
    model: '',
    fuelType: 'petrol',
    price: '',
    images: '',
    lat: '',
    lng: ''
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vehicleApi.create({
        type: form.type,
        brand: form.brand,
        model: form.model,
        fuelType: form.fuelType,

        // ✅ FIX price structure
        price: {
          hour: Number(form.price),
          day: Number(form.price),
          week: Number(form.price) * 5
        },

        images: form.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),

        // ✅ FIX location (GeoJSON)
        location: {
          lat: Number(form.lat),
          lng: Number(form.lng)
        }
      });

      show('Vehicle added', 'success');

      setForm({
        type: 'car',
        brand: '',
        model: '',
        fuelType: 'petrol',
        price: '',
        images: '',
        lat: '',
        lng: ''
      });

    } catch (err: any) {
      show(err?.response?.data?.message || 'Failed to add vehicle', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl card rounded-xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Owner Dashboard</h2>

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        >
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>

        <input required placeholder="Brand"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        <input required placeholder="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        <select
          value={form.fuelType}
          onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        >
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
        </select>

        <input required placeholder="Base Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        {/* ✅ LAT */}
        <input
          required
          type="number"
          step="0.000001"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        {/* ✅ LNG */}
        <input
          required
          type="number"
          step="0.000001"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
          className="bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        <input
          placeholder="Image URLs (comma separated)"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="sm:col-span-2 bg-white/5 border border-white/10 rounded px-3 py-2"
        />

        <button
          disabled={loading}
          className="sm:col-span-2 inline-flex justify-center items-center gap-2 px-3 py-2 rounded bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
        >
          {loading && <Spinner />}
          Add Vehicle
        </button>

      </form>

      {message && <Toast message={message} type={type} />}
    </div>
  );
}