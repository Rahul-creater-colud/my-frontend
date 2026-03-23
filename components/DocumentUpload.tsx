'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/lib/useToast';
import Toast from './Toast';
import Spinner from './Spinner';
import { vehicleApi } from '@/lib/api';

interface Doc {
  _id: string;
  type: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
}

const DOC_TYPES = [
  { key: 'aadhaar',          label: 'Aadhaar Card',       icon: '🪪', required: true },
  { key: 'driving_license',  label: 'Driving License',    icon: '🚗', required: true },
  { key: 'selfie',           label: 'Selfie with ID',     icon: '📸', required: false },
];

const OWNER_DOC_TYPES = [
  { key: 'aadhaar',            label: 'Aadhaar Card',      icon: '🪪', required: true },
  { key: 'vehicle_rc',         label: 'Vehicle RC',        icon: '📄', required: true },
  { key: 'vehicle_insurance',  label: 'Vehicle Insurance', icon: '🛡️', required: true },
];

const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: 'var(--warning)',  bg: 'rgba(255,181,71,0.15)',  label: '⏳ Pending' },
  verified: { color: 'var(--accent)',   bg: 'var(--accent-dim)',      label: '✅ Verified' },
  rejected: { color: 'var(--danger)',   bg: 'rgba(255,77,106,0.15)', label: '✕ Rejected' },
};

export default function DocumentUpload({ role }: { role: 'rider' | 'owner' }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { message, type, show } = useToast();

  const docTypes = role === 'owner' ? OWNER_DOC_TYPES : DOC_TYPES;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/documents/mine`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => setDocs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDoc = (type: string) => docs.find(d => d.type === type);

  const uploadDoc = async (docType: string, file: File) => {
    setUploading(docType);
    try {
      // Cloudinary pe upload karo
      const url = await vehicleApi.uploadImage(file);

      // Backend pe save karo
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: docType, url }),
      });
      const data = await res.json();

      setDocs(prev => {
        const existing = prev.find(d => d.type === docType);
        if (existing) return prev.map(d => d.type === docType ? data.data : d);
        return [...prev, data.data];
      });

      show('Document uploaded!', 'success');
    } catch {
      show('Upload failed', 'error');
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          📋 My Documents
        </h2>
        <span className="text-xs text-[var(--muted)]">
          ({docs.filter(d => d.status === 'verified').length}/{docTypes.length} verified)
        </span>
      </div>

      <div className="space-y-3">
        {docTypes.map((dt) => {
          const doc = getDoc(dt.key);
          const status = doc ? statusStyle[doc.status] : null;

          return (
            <div key={dt.key} className="card p-4 flex items-center gap-4">
              <span className="text-2xl">{dt.icon}</span>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {dt.label}
                  </p>
                  {dt.required && (
                    <span className="text-xs text-[var(--danger)]">*required</span>
                  )}
                  {status && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  )}
                </div>
                {doc?.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs mt-0.5 hover:underline"
                    style={{ color: 'var(--accent2)' }}>
                    View uploaded file →
                  </a>
                )}
              </div>

              <label className="cursor-pointer">
                <div className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  {uploading === dt.key ? (
                    <><Spinner /><span>Uploading...</span></>
                  ) : (
                    <>{doc ? '🔄 Update' : '📤 Upload'}</>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDoc(dt.key, file);
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Warning agar required docs nahi hain */}
      {docTypes.filter(dt => dt.required && !getDoc(dt.key)).length > 0 && (
        <div className="rounded-xl p-3 text-sm"
          style={{ background: 'rgba(255,181,71,0.1)', border: '1px solid rgba(255,181,71,0.3)', color: 'var(--warning)' }}>
          ⚠️ Please upload all required documents to use full app features.
        </div>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}