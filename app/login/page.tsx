'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Toast from '@/components/Toast';
import { useToast } from '@/lib/useToast';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify
  const [loading, setLoading] = useState(false);

  const { message, type, show } = useToast();
  const router = useRouter();

  // 🔥 SEND OTP
  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ phone });

      // 👇 OTP SHOW (testing)
      alert("Your OTP is: " + res.data.otp);

      show('OTP sent!', 'success');
      setStep(2);
    } catch (err: any) {
      show('Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone, code });

      localStorage.setItem('token', res.data.accessToken);

      show('Login successful!', 'success');
      router.push('/');
    } catch (err: any) {
      show('Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card rounded-xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Login with OTP</h2>

      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
          />

          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-emerald-500 py-2 rounded"
          >
            {loading && <Spinner />} Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-emerald-500 py-2 rounded"
          >
            {loading && <Spinner />} Verify OTP
          </button>
        </>
      )}

      {message && <Toast message={message} type={type} />}
    </div>
  );
}