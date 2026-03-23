'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { getUserFromToken } from '@/lib/auth';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      setAuthed(true);
      const user = getUserFromToken(token);
      setRole(user?.role || null);
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
    setRole(null);
    router.push('/login');
  };

  const links = [
    { href: '/', label: 'Explore' },
    ...(authed ? [{ href: '/bookings', label: 'My Rides' }] : []),
    ...(authed ? [{ href: '/profile', label: 'Profile' }] : []),
    ...(authed && (role === 'owner' || role === 'admin')
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : []),
    ...(authed && (role === 'owner' || role === 'admin')
      ? [{ href: '/earnings', label: 'Earnings' }]
      : []),
    ...(authed && role === 'admin'
      ? [{ href: '/admin', label: '👨‍💼 Admin' }]
      : []),
  ];

  return (
    <nav className={clsx('sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'backdrop-blur-xl bg-[rgba(8,12,20,0.85)] border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        : 'bg-transparent')}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#080C14] font-bold text-sm"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}>R</div>
          <span className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Ride<span style={{ color: 'var(--accent)' }}>Now</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === l.href
                  ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/[0.05]')}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!authed ? (
            <>
              <Link href="/login" className="btn btn-secondary text-sm py-2 px-4">Login</Link>
              <Link href="/signup" className="btn btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07]">
                <div className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
                <span className="text-xs text-[var(--muted)] capitalize">{role}</span>
              </div>
              <NotificationBell />
              <button onClick={logout} className="btn btn-secondary text-sm py-2 px-4">Logout</button>
            </div>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg bg-white/[0.05]"
          onClick={() => setMenuOpen(!menuOpen)}>
          <div className={clsx('w-5 h-0.5 bg-current mb-1 transition-all', menuOpen && 'rotate-45 translate-y-1.5')} />
          <div className={clsx('w-5 h-0.5 bg-current mb-1 transition-all', menuOpen && 'opacity-0')} />
          <div className={clsx('w-5 h-0.5 bg-current transition-all', menuOpen && '-rotate-45 -translate-y-1.5')} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1 border-t border-white/[0.07]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={clsx('block px-4 py-3 rounded-lg text-sm font-medium transition-all',
                pathname === l.href
                  ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]')}>
              {l.label}
            </Link>
          ))}
          {!authed ? (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn btn-secondary text-sm flex-1"
                onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="btn btn-primary text-sm flex-1"
                onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              <NotificationBell />
              <button onClick={logout} className="btn btn-secondary text-sm flex-1">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}