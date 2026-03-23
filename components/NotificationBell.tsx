'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const token = getToken();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const notifs = data.data || [];
      setNotifications(notifs);
      setUnread(notifs.filter((n: Notification) => !n.read).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Outside click close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/${notif._id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (notif.link) {
      router.push(notif.link);
      setOpen(false);
    }
  };

  const typeIcon: Record<string, string> = {
    booking_created:   '🚗',
    booking_approved:  '✅',
    booking_rejected:  '✕',
    booking_cancelled: '❌',
    ride_started:      '🏁',
    ride_completed:    '🎉',
    new_message:       '💬',
    document_verified: '✅',
    document_rejected: '✕',
  };

  if (!token) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-lg transition-all hover:bg-white/[0.05]"
        style={{ color: 'var(--muted)' }}>
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--danger)', color: '#fff' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Notifications
            </p>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="text-xs hover:underline"
                style={{ color: 'var(--accent)' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-[var(--muted)]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id}
                  onClick={() => handleClick(n)}
                  className="flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-white/[0.03] border-b border-white/[0.04]"
                  style={!n.read ? { background: 'rgba(0,229,160,0.04)' } : {}}>
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {typeIcon[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate"
                      style={{ color: n.read ? 'var(--muted)' : 'var(--text)' }}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: 'short'
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: 'var(--accent)' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}