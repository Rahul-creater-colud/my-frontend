'use client';
import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import { useToast } from '@/lib/useToast';
import { requireAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'vehicles' | 'bookings' | 'documents';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const { message, type, show } = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const user = requireAuth();
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
    loadOverview();
  }, []);

  useEffect(() => {
    if (tab === 'overview') loadOverview();
    else if (tab === 'users') loadUsers();
    else if (tab === 'vehicles') loadVehicles();
    else if (tab === 'bookings') loadBookings();
    else if (tab === 'documents') loadDocuments();
  }, [tab]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const [users, vehicles, bookings] = await Promise.all([
        fetch(`${base}/api/v1/admin/users`, { headers }).then(r => r.json()),
        fetch(`${base}/api/v1/vehicles`, { headers }).then(r => r.json()),
        fetch(`${base}/api/v1/admin/bookings`, { headers }).then(r => r.json()),
      ]);
      setData({
        totalUsers: users.data?.length || 0,
        totalVehicles: vehicles.data?.length || 0,
        totalBookings: bookings.data?.length || 0,
        totalRevenue: bookings.data?.reduce((sum: number, b: any) => sum + (b.amount || 0), 0) || 0,
      });
    } catch { show('Could not load overview', 'error'); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/admin/users`, { headers });
      const json = await res.json();
      setData({ users: json.data || [] });
    } catch { show('Could not load users', 'error'); }
    finally { setLoading(false); }
  };

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/vehicles`, { headers });
      const json = await res.json();
      setData({ vehicles: json.data || [] });
    } catch { show('Could not load vehicles', 'error'); }
    finally { setLoading(false); }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/admin/bookings`, { headers });
      const json = await res.json();
      setData({ bookings: json.data || [] });
    } catch { show('Could not load bookings', 'error'); }
    finally { setLoading(false); }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/documents/all`, { headers });
      const json = await res.json();
      setData({ documents: json.data || [] });
    } catch { show('Could not load documents', 'error'); }
    finally { setLoading(false); }
  };

  const verifyDocument = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await fetch(`${base}/api/v1/documents/${id}/verify`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      show(`Document ${status}!`, 'success');
      loadDocuments();
    } catch { show('Failed', 'error'); }
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      await fetch(`${base}/api/v1/admin/users/${id}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role }),
      });
      show('Role updated!', 'success');
      loadUsers();
    } catch { show('Failed', 'error'); }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview',   label: 'Overview',   icon: '📊' },
    { key: 'users',      label: 'Users',      icon: '👥' },
    { key: 'vehicles',   label: 'Vehicles',   icon: '🚗' },
    { key: 'bookings',   label: 'Bookings',   icon: '📋' },
    { key: 'documents',  label: 'Documents',  icon: '📄' },
  ];

  const statusStyle: Record<string, { color: string; bg: string }> = {
    pending:   { color: 'var(--warning)', bg: 'rgba(255,181,71,0.15)' },
    verified:  { color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    rejected:  { color: 'var(--danger)',  bg: 'rgba(255,77,106,0.15)' },
    active:    { color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    inactive:  { color: 'var(--danger)',  bg: 'rgba(255,77,106,0.15)' },
    completed: { color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    ongoing:   { color: 'var(--accent2)', bg: 'rgba(0,184,255,0.15)' },
    approved:  { color: 'var(--warning)', bg: 'rgba(255,181,71,0.15)' },
    cancelled: { color: 'var(--muted)',   bg: 'rgba(107,122,153,0.2)' },
    rejected2: { color: 'var(--danger)',  bg: 'rgba(255,77,106,0.15)' },
  };

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          👨‍💼 Admin Panel
        </h1>
        <p className="text-sm text-[var(--muted)]">Manage everything</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.key
              ? { background: 'var(--accent)', color: '#080C14', fontWeight: 600 }
              : { background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',    value: data.totalUsers || 0,    icon: '👥', color: 'var(--accent2)' },
                { label: 'Total Vehicles', value: data.totalVehicles || 0, icon: '🚗', color: 'var(--accent)' },
                { label: 'Total Bookings', value: data.totalBookings || 0, icon: '📋', color: 'var(--warning)' },
                { label: 'Total Revenue',  value: `₹${data.totalRevenue || 0}`, icon: '💰', color: 'var(--accent)' },
              ].map((s) => (
                <div key={s.label} className="card p-5 space-y-2">
                  <p className="text-3xl">{s.icon}</p>
                  <p className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-3">
              {(data.users || []).map((u: any) => (
                <div key={u._id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {(u.name || u.phone)?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {u.name || 'No name'} • +91 {u.phone}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u._id, e.target.value)}
                    className="input text-xs py-1.5 px-3"
                    style={{ width: 'auto' }}>
                    <option value="rider">Rider</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
              {(data.users || []).length === 0 && (
                <div className="card p-10 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-[var(--muted)]">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* VEHICLES */}
          {tab === 'vehicles' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.vehicles || []).map((v: any) => (
                <div key={v._id} className="card p-4 space-y-3">
                  <div className="h-36 rounded-xl overflow-hidden bg-[var(--surface2)]">
                    <img src={v.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-[var(--muted)]">₹{v.price?.day}/day • {v.fuelType}</p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={v.status === 'active'
                      ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
                      : { background: 'rgba(255,77,106,0.1)', color: 'var(--danger)' }}>
                    {v.status}
                  </span>
                </div>
              ))}
              {(data.vehicles || []).length === 0 && (
                <div className="card p-10 text-center col-span-3">
                  <p className="text-4xl mb-3">🚗</p>
                  <p className="text-[var(--muted)]">No vehicles found</p>
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS */}
          {tab === 'bookings' && (
            <div className="space-y-3">
              {(data.bookings || []).map((b: any) => (
                <div key={b._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {b.vehicle?.brand} {b.vehicle?.model}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Rider: {b.rider?.phone} •{' '}
                      {new Date(b.start).toLocaleDateString('en-IN')} →{' '}
                      {new Date(b.end).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                      ₹{b.amount}
                    </p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                      style={statusStyle[b.status] || { color: 'var(--muted)', bg: 'transparent' }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
              {(data.bookings || []).length === 0 && (
                <div className="card p-10 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-[var(--muted)]">No bookings found</p>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'documents' && (
            <div className="space-y-3">
              {(data.documents || []).map((d: any) => (
                <div key={d._id} className="card p-4 flex items-center gap-4">
                  <a href={d.url} target="_blank" rel="noopener noreferrer"
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface2)] flex items-center justify-center text-2xl">
                    {d.url?.includes('.pdf') ? '📄' : <img src={d.url} className="w-full h-full object-cover" />}
                  </a>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>
                      {d.type?.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {d.user?.name || d.user?.phone} • {d.user?.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={statusStyle[d.status] || { color: 'var(--muted)' }}>
                      {d.status}
                    </span>
                    {d.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyDocument(d._id, 'verified')}
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.3)' }}>
                          ✅ Verify
                        </button>
                        <button
                          onClick={() => verifyDocument(d._id, 'rejected')}
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(255,77,106,0.15)', color: 'var(--danger)', border: '1px solid rgba(255,77,106,0.3)' }}>
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(data.documents || []).length === 0 && (
                <div className="card p-10 text-center">
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-[var(--muted)]">No documents found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}