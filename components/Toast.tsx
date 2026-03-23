'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={clsx(
      'fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
      type === 'success'
        ? 'bg-[rgba(0,229,160,0.15)] border border-[rgba(0,229,160,0.3)] text-[var(--accent)]'
        : 'bg-[rgba(255,77,106,0.15)] border border-[rgba(255,77,106,0.3)] text-[var(--danger)]'
    )}>
      <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}