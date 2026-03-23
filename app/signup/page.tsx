'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, userApi } from '@/lib/api';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { useToast } from '@/lib/useToast';

export default function SignupPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'rider' | 'owner'>('rider');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { message, type, show } = useToast();
  const router = useRouter();

  const sendOtp = async () => {
    if (!phone || phone.length < 10) { show('Enter a valid phone number', 'error'); return; }
    setLoading(true);
    try {
      await authApi.sendOtp({ phone });
      show('OTP sent! Check your phone.', 'success');
      setStep('otp');
    } catch (err: any) { show(err?.response?.data?.message || 'Failed to send OTP', 'error'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (code.length !== 6) { show('Enter 6-digit OTP', 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone, code });
      localStorage.setItem('token', res.data.accessToken);

      // Role set karo agar owner hai
      if (role === 'owner') {
        await userApi.updateProfile({});
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${res.data.accessToken}`
          },
          body: JSON.stringify({ role: 'owner' })
        });
      }

      show('Account ready! Welcome 🎉', 'success');
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) { show(err?.response?.data?.message || 'Invalid OTP', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)' }}>🏍️</div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            {step === 'phone' ? 'Join RideNow' : 'Verify your number'}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {step === 'phone' ? 'Create your account in seconds' : `OTP sent to +91 ${phone}`}
          </p>
        </div>

        <div className="card p-6 space-y-4">
          {step === 'phone' ? (
            <>
              {/* Role Selection */}
              <div>
                <label className="label">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('rider')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={role === 'rider'
                      ? { background: 'var(--accent-dim)', border: '2px solid var(--accent)', color: 'var(--accent)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.07)', color: 'var(--muted)' }}>
                    <span className="text-3xl">🏍️</span>
                    <span className="text-sm font-medium">Rent a Vehicle</span>
                    <span className="text-xs opacity-70">Rider</span>
                  </button>
                  <button type="button" onClick={() => setRole('owner')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={role === 'owner'
                      ? { background: 'var(--accent-dim)', border: '2px solid var(--accent)', color: 'var(--accent)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.07)', color: 'var(--muted)' }}>
                    <span className="text-3xl">🚗</span>
                    <span className="text-sm font-medium">List my Vehicle</span>
                    <span className="text-xs opacity-70">Owner</span>
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="label">Phone number</label>
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-[10px] text-sm border border-r-0"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)' }}>
                    +91
                  </span>
                  <input type="tel" placeholder="9876543210" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    className="input flex-1" style={{ borderRadius: '0 10px 10px 0' }} maxLength={10} />
                </div>
              </div>

              <button onClick={sendOtp} disabled={loading || phone.length < 10} className="btn btn-primary w-full">
                {loading ? <Spinner /> : 'Get OTP →'}
              </button>
            </>
          ) : (
            <>
              {/* Role confirm */}
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)' }}>
                <span className="text-2xl">{role === 'rider' ? '🏍️' : '🚗'}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    {role === 'rider' ? 'Rider Account' : 'Owner Account'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {role === 'rider' ? 'Rent vehicles easily' : 'List & manage your vehicles'}
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Enter OTP</label>
                <input type="text" inputMode="numeric" placeholder="• • • • • •" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  className="input text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} />
              </div>

              <button onClick={verifyOtp} disabled={loading || code.length !== 6} className="btn btn-primary w-full">
                {loading ? <Spinner /> : 'Verify & Continue →'}
              </button>
              <button onClick={() => { setStep('phone'); setCode(''); }} className="btn btn-secondary w-full text-sm">
                ← Change number
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }} className="hover:underline">Login</Link>
        </p>
      </div>
      {message && <Toast message={message} type={type} />}
    </div>
  );
}