'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Send, Sparkles, User } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; text: string; ts: number };

export default function AetherPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Hi! I\'m Aether — your factory copilot. Ask me about production, machines, projects, attendance, or anything on the plant floor.',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<string>(`web-${Math.random().toString(36).slice(2, 10)}`);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', text, ts: Date.now() };
    setMsgs((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await api.post<{ reply: string }>('/ai/chat', {
        message: text,
        session_id: sessionRef.current,
      });
      setMsgs((m) => [...m, { role: 'assistant', text: res.reply || '…', ts: Date.now() }]);
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          text: `Sorry, I couldn't respond. ${e?.message?.slice(0, 100) || 'Please retry.'}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'How many machines are running today?',
    'Show me active projects',
    'Late arrivals this week',
    'What needs maintenance soon?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-1 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          Aether Copilot
        </h1>
        <p className="text-textSecondary">Your AI assistant, grounded in live plant data.</p>
      </div>

      <div className="clay flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`clay-sm w-9 h-9 flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? '' : ''
                }`}
              >
                {m.role === 'user' ? (
                  <User className="w-4 h-4 text-textSecondary" />
                ) : (
                  <Sparkles className="w-4 h-4 text-primary" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-4 ${
                  m.role === 'user' ? 'clay-btn text-white' : 'clay-sm text-text'
                } whitespace-pre-wrap text-sm leading-relaxed`}
                style={m.role === 'user' ? { borderRadius: '1rem' } : {}}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="clay-sm w-9 h-9 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="clay-sm p-4 text-sm text-textMuted">Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {msgs.length <= 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                }}
                className="clay-sm text-xs px-3 py-2 text-textSecondary hover:text-text"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-divider/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aether anything…"
              className="clay-input flex-1 text-text"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="clay-btn px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
