'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => setAuthed(!!localStorage.getItem('token')), []);

  const logout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
    router.push('/login');
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/bookings', label: 'My Bookings' },
    { href: '/dashboard', label: 'Owner Dashboard' }
  ];

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold text-emerald-400">RideNow</Link>
        <div className="flex items-center gap-4">
          {links.map(l => (
            <Link key={l.href}
              href={l.href}
              className={clsx('px-3 py-1 rounded-md hover:text-emerald-300',
                pathname === l.href && 'bg-white/10 text-emerald-300')}>
              {l.label}
            </Link>
          ))}
          {!authed ? (
            <>
              <Link href="/login" className="px-3 py-1 hover:text-emerald-300">Login</Link>
              <Link href="/signup" className="px-3 py-1 rounded bg-emerald-500 text-black">Sign Up</Link>
            </>
          ) : (
            <button onClick={logout} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}
