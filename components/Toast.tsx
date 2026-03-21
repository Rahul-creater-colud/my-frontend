'use client';
import clsx from 'clsx';

export default function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={clsx(
      'fixed top-4 right-4 px-4 py-3 rounded shadow-lg text-sm text-white',
      type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
    )}>
      {message}
    </div>
  );
}
