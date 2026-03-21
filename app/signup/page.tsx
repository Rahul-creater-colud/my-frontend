'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api';

export default function SignupPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 SEND OTP
  const sendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await authApi.sendOtp({ phone });

      console.log("SUCCESS:", res.data);

      // ✅ OTP SHOW (MAIN FIX)
      alert("Your OTP is: " + res.data.otp);

      setStep('otp');

    } catch (err: any) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND ERROR:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await authApi.verifyOtp({ phone, code });

      localStorage.setItem('token', res.data.accessToken);

      alert('Login Successful ✅');

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 card p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Signup / Login</h2>

      {step === 'phone' ? (
        <>
          <input
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 rounded bg-white/10"
          />
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-emerald-500 py-2 rounded"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 rounded bg-white/10"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-emerald-500 py-2 rounded"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </>
      )}

      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
}