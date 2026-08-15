'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Cpu } from 'lucide-react';

export default function MachinesList() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/machines').then((r) => setRows(r || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r: any) => {
    const s = q.toLowerCase();
    return !s || (r.name || '').toLowerCase().includes(s) || (r.model || '').toLowerCase().includes(s) || (r.location || '').toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Machines</h1>
          <p className="text-textSecondary">{rows.length} machines in inventory</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="clay-input pl-11 w-80" />
        </div>
      </div>

      {loading ? (
        <div className="clay p-12 text-center text-textMuted">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m: any) => (
            <Link key={m.id} href={`/machines/${m.id}`} className="clay p-5 hover:shadow-clay-hover transition-shadow">
              <div className="flex items-start gap-3">
                <div className="clay-sm w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text truncate">{m.name || 'Unnamed'}</div>
                  <div className="text-xs text-textSecondary truncate">{m.model || '—'}</div>
                  <div className="text-xs text-textMuted truncate mt-0.5">{m.location || '—'}</div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                      m.status === 'running' ? 'bg-successSoft text-success' :
                      m.status === 'maintenance' ? 'bg-warningSoft text-warning' :
                      m.status === 'idle' ? 'bg-infoSoft text-info' :
                      'bg-divider text-textSecondary'
                    }`}>
                      {m.status || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="col-span-full clay p-12 text-center text-textMuted">No machines found.</div>}
        </div>
      )}
    </div>
  );
}
