'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Briefcase } from 'lucide-react';

export default function ProjectsList() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/projects').then((r) => setRows(r || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r: any) => {
    const s = q.toLowerCase();
    return !s || (r.name || '').toLowerCase().includes(s) || (r.client || '').toLowerCase().includes(s) || (r.status || '').toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Projects</h1>
          <p className="text-textSecondary">{rows.length} projects</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="clay-input pl-11 w-80" />
        </div>
      </div>

      {loading ? (
        <div className="clay p-12 text-center text-textMuted">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p: any) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="clay p-5 hover:shadow-clay-hover transition-shadow">
              <div className="flex items-start gap-3">
                <div className="clay-sm w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text truncate">{p.name || 'Untitled Project'}</div>
                  {p.client && <div className="text-xs text-textSecondary truncate">Client: {p.client}</div>}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                      p.status === 'active' ? 'bg-successSoft text-success' :
                      p.status === 'completed' ? 'bg-infoSoft text-info' :
                      p.status === 'on_hold' ? 'bg-warningSoft text-warning' :
                      'bg-divider text-textSecondary'
                    }`}>{p.status || '—'}</span>
                    {p.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                        p.priority === 'high' ? 'bg-dangerSoft text-danger' :
                        p.priority === 'medium' ? 'bg-warningSoft text-warning' :
                        'bg-infoSoft text-info'
                      }`}>{p.priority}</span>
                    )}
                  </div>
                  {p.description && <p className="text-xs text-textSecondary mt-3 line-clamp-2">{p.description}</p>}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="col-span-full clay p-12 text-center text-textMuted">No projects found.</div>}
        </div>
      )}
    </div>
  );
}
