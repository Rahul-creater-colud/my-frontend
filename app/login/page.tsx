'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { useToast } from '@/lib/useToast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const { message, type, show } = useToast();
  const router = useRouter();

  const sendOtp = async () => {
    if (!phone || phone.length < 10) { show('Enter a valid phone number', 'error'); return; }
    setLoading(true);
    try {
      await authApi.sendOtp({ phone });
      show('OTP sent to your phone!', 'success');
      setStep(2);
    } catch (err: any) { show(err?.response?.data?.message || 'Failed to send OTP', 'error'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (code.length !== 6) { show('Enter 6-digit OTP', 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone, code });
      localStorage.setItem('token', res.data.accessToken);
      show('Welcome back!', 'success');
      setTimeout(() => {
  const role = res.data.user?.role;
  if (role === 'owner' || role === 'admin') router.push('/dashboard');
  else router.push('/');
}, 800);
    } catch (err: any) { show(err?.response?.data?.message || 'Invalid OTP', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)' }}>
            {step === 1 ? '📱' : '🔐'}
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            {step === 1 ? 'Welcome back' : 'Verify OTP'}
          </h1>
          <p className="text-sm text-[var(--muted)]">{step === 1 ? 'Enter your phone number to continue' : `OTP sent to ${phone}`}</p>
        </div>

        <div className="card p-6 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="label">Phone number</label>
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-[10px] text-sm border border-r-0"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)' }}>+91</span>
                  <input type="tel" placeholder="9876543210" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    className="input flex-1" style={{ borderRadius: '0 10px 10px 0' }} maxLength={10} />
                </div>
              </div>
              <button onClick={sendOtp} disabled={loading || phone.length < 10} className="btn btn-primary w-full">
                {loading ? <Spinner /> : 'Send OTP →'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input type="text" inputMode="numeric" placeholder="• • • • • •" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  className="input text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} />
              </div>
              <button onClick={verifyOtp} disabled={loading || code.length !== 6} className="btn btn-primary w-full">
                {loading ? <Spinner /> : 'Verify & Login →'}
              </button>
              <button onClick={() => { setStep(1); setCode(''); }} className="btn btn-secondary w-full text-sm">← Change number</button>
            </>
          )}
        </div>
        <p className="text-center text-sm text-[var(--muted)] mt-4">
          New user? <Link href="/signup" style={{ color: 'var(--accent)' }} className="hover:underline">Create account</Link>
        </p>
      </div>
      {message && <Toast message={message} type={type} />}
    </div>
  );
}