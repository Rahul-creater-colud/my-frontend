'use client';
import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import { useToast } from '@/lib/useToast';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import DocumentUpload from '@/components/DocumentUpload';
import TrustScore from '@/components/TrustScore';
import { requireAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { message, type, show } = useToast();

  useEffect(() => {
    const user = requireAuth();
    if (!user) { router.push('/login'); return; }
    setUserId(user.id);

    userApi.profile()
      .then((res) => {
        const data = res.data?.data;
        setName(data?.name || '');
        setPhone(data?.phone || '');
        setRole(data?.role || '');
      })
      .catch(() => show('Could not load profile', 'error'))
      .finally(() => setLoading(false));
  }, [router, show]);

  const save = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ name });
      show('Profile updated!', 'success');
    } catch {
      show('Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          My Profile
        </h1>
        <p className="text-sm text-[var(--muted)]">Manage your account details</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '2px solid rgba(0,229,160,0.3)' }}>
          {(name || phone)?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            {name || 'No name set'}
          </p>
          <p className="text-sm text-[var(--muted)]">+91 {phone}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.2)' }}>
            {role}
          </span>
        </div>
      </div>

      {/* Trust Score — riders ke liye */}
      {userId && role === 'rider' && (
        <TrustScore userId={userId} />
      )}

      {/* Edit Form */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Edit Details
        </h2>
        <div>
          <label className="label">Full name</label>
          <input placeholder="Enter your name" value={name}
            onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Phone number</label>
          <input value={`+91 ${phone}`} disabled
            className="input opacity-50 cursor-not-allowed" />
          <p className="text-xs text-[var(--muted)] mt-1">Phone number change nahi ho sakta</p>
        </div>
        <div>
          <label className="label">Account type</label>
          <input value={role} disabled
            className="input opacity-50 cursor-not-allowed capitalize" />
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary w-full">
          {saving ? <Spinner /> : 'Save Changes'}
        </button>
      </div>

      {/* Become Owner */}
      {role === 'rider' && (
        <div className="card p-6 space-y-3"
          style={{ border: '1px solid rgba(0,229,160,0.2)' }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            🚗 Become an Owner
          </h2>
          <p className="text-sm text-[var(--muted)]">Apni vehicle list karo aur paise kamao!</p>
          <button
            onClick={async () => {
              try {
                await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me/role`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({ role: 'owner' })
                });
                show('You are now an Owner! Please login again.', 'success');
                setTimeout(() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }, 2000);
              } catch {
                show('Failed to update role', 'error');
              }
            }}
            className="btn btn-primary w-full">
            Switch to Owner Account
          </button>
        </div>
      )}

      {/* Documents */}
      {(role === 'rider' || role === 'owner') && (
        <DocumentUpload role={role as 'rider' | 'owner'} />
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}