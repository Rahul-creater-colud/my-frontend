'use client';
import { useEffect, useState } from 'react';
import { vehicleApi, bookingApi } from '@/lib/api';
import { Vehicle, Booking } from '@/lib/types';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import { useToast } from '@/lib/useToast';
import { requireAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ConditionReportForm from '@/components/ConditionReportForm';
import ConditionReportView from '@/components/ConditionReportView';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import AIPriceSuggester from '@/components/AIPriceSuggester';
import InspectionChecklist from '@/components/InspectionChecklist';
import LateFineCard from '@/components/LateFineCard';

type Tab = 'add' | 'vehicles' | 'bookings';

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('add');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [reportBooking, setReportBooking] = useState<string | null>(null);
  const [calendarVehicle, setCalendarVehicle] = useState<string | null>(null);
  const [checklistBooking, setChecklistBooking] = useState<string | null>(null);
  const [fineBooking, setFineBooking] = useState<string | null>(null);
  const { message, type, show } = useToast();

  const [form, setForm] = useState({
    type: 'car', brand: '', model: '', fuelType: 'petrol',
    priceHour: '', priceDay: '', priceWeek: '',
    images: [] as string[], lat: '', lng: '',
  });

  useEffect(() => {
    const user = requireAuth();
    if (!user) { router.push('/login'); return; }
    if (user.role === 'rider') { router.push('/'); return; }
  }, [router]);

  useEffect(() => {
    if (tab === 'vehicles') loadMyVehicles();
    if (tab === 'bookings') loadOwnerBookings();
  }, [tab]);

  const loadMyVehicles = async () => {
    setDataLoading(true);
    try {
      const res = await vehicleApi.myVehicles();
      const data = res.data?.data || res.data;
      setVehicles(Array.isArray(data) ? data : []);
    } catch { show('Could not load vehicles', 'error'); }
    finally { setDataLoading(false); }
  };

  const loadOwnerBookings = async () => {
    setDataLoading(true);
    try {
      const res = await bookingApi.ownerBookings();
      const data = res.data?.data || res.data?.bookings || res.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch { show('Could not load bookings', 'error'); }
    finally { setDataLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImageUploading(true);
    try {
      const urls: string[] = [];
      await Promise.all(Array.from(files).map(async (file) => {
        try { const url = await vehicleApi.uploadImage(file); urls.push(url); }
        catch { show(`Failed to upload ${file.name}`, 'error'); }
      }));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      show(`${urls.length} image(s) uploaded`, 'success');
    } finally { setImageUploading(false); }
  };

  const removeImage = (idx: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lat || !form.lng) { show('Enter location coordinates', 'error'); return; }
    setLoading(true);
    try {
      await vehicleApi.create({
        type: form.type as any, brand: form.brand, model: form.model, fuelType: form.fuelType,
        price: { hour: Number(form.priceHour), day: Number(form.priceDay), week: Number(form.priceWeek) },
        images: form.images,
        location: { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)] },
      });
      show('Vehicle listed! 🎉', 'success');
      setForm({ type: 'car', brand: '', model: '', fuelType: 'petrol', priceHour: '', priceDay: '', priceWeek: '', images: [], lat: '', lng: '' });
    } catch (err: any) { show(err?.response?.data?.message || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const updateVehicleStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await vehicleApi.update(id, { status });
      show(`Vehicle ${status}!`, 'success');
      setVehicles(prev => prev.map(v => v._id === id ? { ...v, status } : v));
    } catch { show('Failed to update', 'error'); }
  };

  const updateBookingStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await bookingApi.updateStatus(id, status);
      show(`Booking ${status}`, 'success');
      loadOwnerBookings();
    } catch { show('Failed to update status', 'error'); }
  };

  const checkAndEndRide = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/late-fines/calculate/${bookingId}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.isLate) {
        show(`⏰ Late by ${data.lateHours}hr! Fine: ₹${data.fineAmount}`, 'error');
        setFineBooking(bookingId);
      } else {
        show('✅ On time! No fine.', 'success');
        await bookingApi.endRide(bookingId);
        loadOwnerBookings();
      }
    } catch { show('Failed to check fine', 'error'); }
  };

  const waiveFineAndEnd = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    try {
      const fineRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/late-fines/booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json());

      if (fineRes.data?._id) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/late-fines/${fineRes.data._id}/waive`,
          { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
        );
        show('Fine waived! 🎉', 'success');
      }
      await bookingApi.endRide(bookingId);
      setFineBooking(null);
      loadOwnerBookings();
    } catch { show('Failed', 'error'); }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'add',      label: 'Add Vehicle', icon: '➕' },
    { key: 'vehicles', label: 'My Vehicles', icon: '🚗' },
    { key: 'bookings', label: 'Bookings',    icon: '📋' },
  ];

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Owner Dashboard
        </h1>
        <p className="text-sm text-[var(--muted)]">Manage your vehicles and bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.key
              ? { background: 'var(--accent)', color: '#080C14', fontWeight: 600 }
              : { color: 'var(--muted)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ADD VEHICLE TAB */}
      {tab === 'add' && (
        <form onSubmit={submit} className="card p-6 space-y-5 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vehicle type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div>
              <label className="label">Fuel type</label>
              <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="input">
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input required placeholder="e.g. Honda" value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Model</label>
              <input required placeholder="e.g. City" value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Location coordinates</label>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" step="0.000001" placeholder="Latitude (e.g. 26.9124)"
                value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="input" />
              <input required type="number" step="0.000001" placeholder="Longitude (e.g. 75.7873)"
                value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="input" />
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              💡 Google Maps → right-click → copy coordinates
            </p>
          </div>

          {form.lat && form.lng && (
            <AIPriceSuggester
              vehicleType={form.type}
              fuelType={form.fuelType}
              lat={form.lat}
              lng={form.lng}
              onApply={(prices) => setForm(prev => ({
                ...prev,
                priceHour: prices.hour,
                priceDay:  prices.day,
                priceWeek: prices.week,
              }))}
            />
          )}

          <div>
            <label className="label">Pricing (₹)</label>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: 'priceHour', label: 'Per hour' }, { key: 'priceDay', label: 'Per day' }, { key: 'priceWeek', label: 'Per week' }].map((p) => (
                <div key={p.key}>
                  <p className="text-xs text-[var(--muted)] mb-1">{p.label}</p>
                  <input required type="number" min="0" placeholder="₹"
                    value={(form as any)[p.key]}
                    onChange={(e) => setForm({ ...form, [p.key]: e.target.value })}
                    className="input" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Vehicle photos</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-6"
              style={{ border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}>
              {imageUploading ? (
                <><Spinner /><span className="text-sm text-[var(--muted)]">Uploading...</span></>
              ) : (
                <><span className="text-3xl">📸</span><span className="text-sm text-[var(--muted)]">Click to upload</span></>
              )}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} className="w-20 h-20 rounded-xl object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'var(--danger)', color: '#fff' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || imageUploading} className="btn btn-primary w-full">
            {loading ? <Spinner /> : '🚀 List Vehicle'}
          </button>
        </form>
      )}

      {/* MY VEHICLES TAB */}
      {tab === 'vehicles' && (
        <div className="space-y-4">
          {dataLoading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : vehicles.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🚗</p>
              <p className="text-[var(--muted)]">No vehicles listed yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v._id} className="space-y-3">
                  <div className="card p-4 space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-[var(--surface2)]">
                      <img src={v.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                        {v.brand} {v.model}
                      </p>
                      <p className="text-xs text-[var(--muted)]">₹{v.price?.day}/day • {v.fuelType}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium capitalize"
                        style={v.status === 'active'
                          ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
                          : { background: 'rgba(255,77,106,0.1)', color: 'var(--danger)' }}>
                        {v.status}
                      </span>
                      <button
                        onClick={() => updateVehicleStatus(v._id, v.status === 'active' ? 'inactive' : 'active')}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={v.status === 'active'
                          ? { background: 'rgba(255,77,106,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,77,106,0.3)' }
                          : { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }}>
                        {v.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    <button
                      onClick={() => setCalendarVehicle(calendarVehicle === v._id ? null : v._id)}
                      className="text-xs px-3 py-1.5 rounded-lg w-full transition-all"
                      style={{ background: 'rgba(0,184,255,0.15)', color: 'var(--accent2)', border: '1px solid rgba(0,184,255,0.3)' }}>
                      📅 {calendarVehicle === v._id ? 'Close Calendar' : 'Manage Availability'}
                    </button>
                  </div>
                  {calendarVehicle === v._id && (
                    <AvailabilityCalendar vehicleId={v._id} isOwner={true} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          {dataLoading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : bookings.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-[var(--muted)]">No booking requests yet.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="space-y-3">
                <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {b.vehicle?.brand} {b.vehicle?.model}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Rider: {(b.rider as any)?.phone || b.rider?._id} •{' '}
                      {new Date(b.start).toLocaleDateString('en-IN')} →{' '}
                      {new Date(b.end).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-[var(--muted)]">📍 {b.pickupLocation}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-lg font-bold"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                      ₹{b.amount}
                    </p>
                    {b.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateBookingStatus(b._id, 'approved')}
                          className="btn btn-primary text-xs py-1.5 px-3">Approve</button>
                        <button onClick={() => updateBookingStatus(b._id, 'rejected')}
                          className="btn text-xs py-1.5 px-3"
                          style={{ background: 'rgba(255,77,106,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,77,106,0.3)' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                    )}

                    {/* Condition Report */}
                    {(b.status === 'approved' || b.status === 'ongoing' || b.status === 'completed') && (
                      <button
                        onClick={() => setReportBooking(reportBooking === b._id ? null : b._id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(0,184,255,0.15)', color: 'var(--accent2)', border: '1px solid rgba(0,184,255,0.3)' }}>
                        📋 {reportBooking === b._id ? 'Close' : 'Condition Report'}
                      </button>
                    )}

                    {/* Checklist */}
                    {(b.status === 'approved' || b.status === 'ongoing') && (
                      <button
                        onClick={() => setChecklistBooking(checklistBooking === b._id ? null : b._id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }}>
                        ✅ {checklistBooking === b._id ? 'Close' : 'Checklist'}
                      </button>
                    )}

                    {/* ⏰ End Ride + Fine Check */}
                    {b.status === 'ongoing' && (
                      <button
                        onClick={() => checkAndEndRide(b._id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(255,181,71,0.15)', color: 'var(--warning)', border: '1px solid rgba(255,181,71,0.3)' }}>
                        🏁 End Ride + Check Fine
                      </button>
                    )}
                  </div>
                </div>

                {/* Condition Report */}
                {reportBooking === b._id && (
                  <div className="space-y-4">
                    <ConditionReportView bookingId={b._id} />
                    {b.status !== 'completed' && (
                      <ConditionReportForm
                        bookingId={b._id}
                        vehicleId={typeof b.vehicle === 'string' ? b.vehicle : (b.vehicle as any)?._id}
                        reportType={b.status === 'approved' ? 'pickup' : 'return'}
                        onSuccess={() => { setReportBooking(null); show('Report saved! ✅', 'success'); }}
                      />
                    )}
                  </div>
                )}

                {/* Checklist */}
                {checklistBooking === b._id && (
                  <InspectionChecklist
                    bookingId={b._id}
                    vehicleId={typeof b.vehicle === 'string' ? b.vehicle : (b.vehicle as any)?._id}
                    checkType={b.status === 'approved' ? 'pickup' : 'return'}
                    onComplete={() => { setChecklistBooking(null); show('Checklist complete! ✅', 'success'); }}
                  />
                )}

                {/* ⏰ Late Fine Section */}
                {fineBooking === b._id && (
                  <div className="space-y-3">
                    <LateFineCard bookingId={b._id} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => waiveFineAndEnd(b._id)}
                        className="btn btn-secondary text-xs flex-1">
                        🎁 Waive Fine & End Ride
                      </button>
                      <button
                        onClick={async () => {
                          await bookingApi.endRide(b._id);
                          setFineBooking(null);
                          loadOwnerBookings();
                          show('Ride ended! Fine pending.', 'success');
                        }}
                        className="btn btn-primary text-xs flex-1">
                        🏁 End Ride (Fine Applies)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}