'use client';

import { useState, useCallback } from 'react';

export const useToast = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error'>('success');

  const show = useCallback((msg: string, t: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setType(t);
    setTimeout(() => setMessage(null), 2500);
  }, []);

  return { message, type, show };
};