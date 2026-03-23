'use client';
import { useState } from 'react';
import { vehicleApi } from '@/lib/api';
import Spinner from './Spinner';
import Toast from './Toast';
import { useToast } from '@/lib/useToast';

interface Damage {
  part: string;
  description: string;
  photo?: string;
}

export default function ConditionReportForm({
  bookingId,
  vehicleId,
  reportType,
  onSuccess,
}: {
  bookingId: string;
  vehicleId: string;
  reportType: 'pickup' | 'return';
  onSuccess: () => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [fuelLevel, setFuelLevel] = useState('full');
  const [odometer, setOdometer] = useState('');
  const [condition, setCondition] = useState('good');
  const [damages, setDamages] = useState<Damage[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { message, type, show } = useToast();

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      await Promise.all(Array.from(files).map(async (file) => {
        const url = await vehicleApi.uploadImage(file);
        urls.push(url);
      }));
      setPhotos(prev => [...prev, ...urls]);
      show(`${urls.length} photo(s) uploaded`, 'success');
    } catch { show('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const addDamage = () => {
    setDamages(prev => [...prev, { part: '', description: '' }]);
  };

  const removeDamage = (idx: number) => {
    setDamages(prev => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/condition-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId,
            vehicleId,
            reportType,
            photos,
            fuelLevel,
            odometer: odometer ? Number(odometer) : undefined,
            condition,
            damages: damages.filter(d => d.part && d.description),
            notes,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed');
      show('Report submitted! ✅', 'success');
      setTimeout(onSuccess, 1000);
    } catch { show('Failed to submit report', 'error'); }
    finally { setLoading(false); }
  };

  const fuelOptions = [
    { value: 'empty',          label: '⬜ Empty',          icon: '▱▱▱▱' },
    { value: 'quarter',        label: '🔴 Quarter',        icon: '▰▱▱▱' },
    { value: 'half',           label: '🟡 Half',           icon: '▰▰▱▱' },
    { value: 'three_quarter',  label: '🟢 Three Quarter',  icon: '▰▰▰▱' },
    { value: 'full',           label: '✅ Full',           icon: '▰▰▰▰' },
  ];

  const conditionOptions = [
    { value: 'excellent', label: '⭐⭐⭐⭐⭐ Excellent', color: 'var(--accent)' },
    { value: 'good',      label: '⭐⭐⭐⭐ Good',      color: 'var(--accent2)' },
    { value: 'fair',      label: '⭐⭐⭐ Fair',        color: 'var(--warning)' },
    { value: 'poor',      label: '⭐⭐ Poor',          color: 'var(--danger)' },
  ];

  return (
    <form onSubmit={submit} className="card p-5 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{reportType === 'pickup' ? '🚗' : '🏁'}</span>
        <div>
          <h3 className="text-base font-semibold capitalize"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            {reportType} Condition Report
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {reportType === 'pickup' ? 'Before ride starts' : 'After ride ends'}
          </p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="label">Vehicle Photos</label>
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer py-5"
          style={{ border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}>
          {uploading ? (
            <><Spinner /><span className="text-sm text-[var(--muted)]">Uploading...</span></>
          ) : (
            <><span className="text-3xl">📸</span>
            <span className="text-sm text-[var(--muted)]">Take photos of vehicle</span></>
          )}
          <input type="file" multiple accept="image/*" onChange={uploadPhoto} className="hidden" />
        </label>
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {photos.map((p, i) => (
              <div key={i} className="relative group">
                <img src={p} className="w-20 h-20 rounded-xl object-cover" />
                <button type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                  style={{ background: 'var(--danger)', color: '#fff' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fuel Level */}
      <div>
        <label className="label">Fuel Level</label>
        <div className="grid grid-cols-5 gap-2">
          {fuelOptions.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => setFuelLevel(opt.value)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
              style={fuelLevel === opt.value
                ? { background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.3)', color: 'var(--accent)' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              <span className="text-xs font-mono">{opt.icon}</span>
              <span className="text-[10px] text-center leading-tight">
                {opt.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="label">Overall Condition</label>
        <div className="grid grid-cols-2 gap-2">
          {conditionOptions.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => setCondition(opt.value)}
              className="p-3 rounded-xl text-sm text-left transition-all"
              style={condition === opt.value
                ? { background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.3)', color: opt.color }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Odometer */}
      <div>
        <label className="label">Odometer Reading (km)</label>
        <input
          type="number"
          placeholder="e.g. 12500"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          className="input"
        />
      </div>

      {/* Damages */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Damages (if any)</label>
          <button type="button" onClick={addDamage}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,181,71,0.15)', color: 'var(--warning)', border: '1px solid rgba(255,181,71,0.3)' }}>
            + Add Damage
          </button>
        </div>
        {damages.length === 0 && (
          <p className="text-xs text-[var(--muted)] text-center py-3 rounded-xl"
            style={{ border: '1px dashed var(--border)' }}>
            No damages reported ✅
          </p>
        )}
        {damages.map((d, i) => (
          <div key={i} className="space-y-2 p-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.2)' }}>
            <div className="flex gap-2">
              <input
                placeholder="Part (e.g. Front bumper)"
                value={d.part}
                onChange={(e) => setDamages(prev => prev.map((x, idx) => idx === i ? { ...x, part: e.target.value } : x))}
                className="input flex-1 text-sm"
              />
              <button type="button" onClick={() => removeDamage(i)}
                className="px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,77,106,0.15)', color: 'var(--danger)' }}>
                ✕
              </button>
            </div>
            <input
              placeholder="Description (e.g. Small scratch)"
              value={d.description}
              onChange={(e) => setDamages(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))}
              className="input text-sm"
            />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="label">Additional Notes</label>
        <textarea
          placeholder="Any other observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input resize-none"
          style={{ height: 'auto' }}
        />
      </div>

      <button type="submit" disabled={loading || uploading} className="btn btn-primary w-full">
        {loading ? <Spinner /> : `📋 Submit ${reportType === 'pickup' ? 'Pickup' : 'Return'} Report`}
      </button>

      {message && <Toast message={message} type={type} />}
    </form>
  );
}