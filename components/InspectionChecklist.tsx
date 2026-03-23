'use client';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import Toast from './Toast';
import { useToast } from '@/lib/useToast';
import { getUserFromToken, getToken } from '@/lib/auth';

interface CheckItem {
  label: string;
  checked: boolean;
}

const DEFAULT_ITEMS: CheckItem[] = [
  { label: 'Fuel level checked',              checked: false },
  { label: 'Tyres condition OK',              checked: false },
  { label: 'Brakes working properly',         checked: false },
  { label: 'Lights & indicators working',     checked: false },
  { label: 'Documents (RC, Insurance) present', checked: false },
  { label: 'No visible exterior damage',      checked: false },
  { label: 'Engine starts properly',          checked: false },
  { label: 'Mirrors adjusted',                checked: false },
  { label: 'Odometer reading noted',          checked: false },
  { label: 'Keys handover complete',          checked: false },
];

export default function InspectionChecklist({
  bookingId,
  vehicleId,
  checkType,
  onComplete,
}: {
  bookingId: string;
  vehicleId: string;
  checkType: 'pickup' | 'return';
  onComplete?: () => void;
}) {
  const [items, setItems] = useState<CheckItem[]>(DEFAULT_ITEMS);
  const [existing, setExisting] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message, type, show } = useToast();

  const token = getToken();
  const me = token ? getUserFromToken(token) : null;
  const filledBy = me?.role === 'owner' ? 'owner' : 'rider';

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/checklists/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setExisting(data.data || []);
        // Load existing if any
        const mine = (data.data || []).find(
          (c: any) => c.type === checkType && c.filledBy === filledBy
        );
        if (mine) setItems(mine.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const toggleItem = (idx: number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    ));
  };

  const allChecked = items.every(i => i.checked);

  const submit = async () => {
    if (!allChecked) { show('Please check all items before submitting', 'error'); return; }
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/checklists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, vehicleId, type: checkType, filledBy, items }),
      });
      show('Checklist submitted! ✅', 'success');
      onComplete?.();
    } catch { show('Failed to submit', 'error'); }
    finally { setSaving(false); }
  };

  // Already submitted checklist view
  const myChecklist = existing.find(c => c.type === checkType && c.filledBy === filledBy);
  const otherChecklist = existing.find(c => c.type === checkType && c.filledBy !== filledBy);

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{checkType === 'pickup' ? '🔑' : '🏁'}</span>
          <h3 className="text-base font-semibold capitalize"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            {checkType} Checklist
          </h3>
        </div>
        {/* Both sides status */}
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 rounded-full"
            style={myChecklist
              ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
            You {myChecklist ? '✅' : '⏳'}
          </span>
          <span className="text-xs px-2 py-1 rounded-full"
            style={otherChecklist
              ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
            Other {otherChecklist ? '✅' : '⏳'}
          </span>
        </div>
      </div>

      {/* Both agreed */}
      {myChecklist?.agreedByBoth && (
        <div className="rounded-xl p-3 text-center"
          style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.3)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
            ✅ Both parties agreed! Vehicle {checkType} complete.
          </p>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !myChecklist && toggleItem(i)}
            disabled={!!myChecklist}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={{
              background: item.checked ? 'var(--accent-dim)' : 'rgba(255,255,255,0.03)',
              border: item.checked ? '1px solid rgba(0,229,160,0.3)' : '1px solid var(--border)',
              cursor: myChecklist ? 'default' : 'pointer',
            }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: item.checked ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                border: item.checked ? 'none' : '1px solid var(--border2)',
              }}>
              {item.checked && <span className="text-[10px] font-bold text-[#080C14]">✓</span>}
            </div>
            <span className="text-sm" style={{ color: item.checked ? 'var(--accent)' : 'var(--text)' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--muted)' }}>Progress</span>
          <span style={{ color: 'var(--accent)' }}>
            {items.filter(i => i.checked).length}/{items.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${(items.filter(i => i.checked).length / items.length) * 100}%`,
              background: 'var(--accent)',
            }} />
        </div>
      </div>

      {/* Submit Button */}
      {!myChecklist && (
        <button
          type="button"
          onClick={submit}
          disabled={saving || !allChecked}
          className="btn btn-primary w-full">
          {saving ? <Spinner /> : '✅ Submit & Sign Checklist'}
        </button>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}