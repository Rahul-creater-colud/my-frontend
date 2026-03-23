'use client';
import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-lg">🔍</span>
      <input
        type="text"
        placeholder="Search by brand or model..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input pl-10"
      />
      {query && (
        <button onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
          ✕
        </button>
      )}
    </div>
  );
}