'use client';
import { useEffect, useRef, useState } from 'react';
import { messageApi } from '@/lib/api';
import { getToken, getUserFromToken } from '@/lib/auth';
import Spinner from './Spinner';

interface Message {
  _id: string;
  text: string;
  sender: { _id: string; name?: string; phone: string; role: string };
  createdAt: string;
  read: boolean;
}

export default function ChatBox({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const token = getToken();
  const me = token ? getUserFromToken(token) : null;

  const loadMessages = async () => {
    try {
      const res = await messageApi.getMessages(bookingId);
      setMessages(res.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await messageApi.sendMessage(bookingId, text.trim());
      setMessages(prev => [...prev, res.data?.data]);
      setText('');
    } catch {}
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  return (
    <div className="card flex flex-col" style={{ height: '400px' }}>
      <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
        <span className="text-lg">💬</span>
        <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>Chat</p>
        <span className="text-xs text-[var(--muted)] ml-auto">Auto-refreshes every 5s</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm text-[var(--muted)]">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === me?.id || msg.sender?.toString() === me?.id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%] space-y-1">
                  {!isMe && (
                    <p className="text-xs text-[var(--muted)] px-1 capitalize">
                      {msg.sender?.name || msg.sender?.phone} • {msg.sender?.role}
                    </p>
                  )}
                  <div className="px-3 py-2 rounded-2xl text-sm"
                    style={isMe
                      ? { background: 'var(--accent)', color: '#080C14', borderBottomRightRadius: '4px' }
                      : { background: 'var(--surface2)', color: 'var(--text)', borderBottomLeftRadius: '4px' }}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-[var(--muted)] px-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-white/[0.07] flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="input flex-1 py-2 text-sm"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="btn btn-primary px-4 py-2 text-sm">
          {sending ? <Spinner /> : '→'}
        </button>
      </div>
    </div>
  );
}