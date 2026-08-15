'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>(`/projects/${id}`).then(setP).catch(async () => {
      try {
        const list = await api.get<any[]>('/projects');
        setP((list || []).find((x: any) => x.id === id) || null);
      } catch { setP(null); }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="clay p-12 text-center text-textMuted">Loading…</div>;
  if (!p) return (
    <div>
      <Link href="/projects" className="text-primary text-sm inline-flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="clay p-12 text-center text-textMuted">Project not found.</div>
    </div>
  );

  const fields = [
    ['Client', p.client], ['Status', p.status], ['Priority', p.priority],
    ['Start Date', p.start_date], ['End Date', p.end_date], ['Budget', p.budget],
    ['Progress', p.progress ? `${p.progress}%` : undefined], ['Manager', p.manager],
  ].filter((f) => f[1]);

  return (
    <div>
      <Link href="/projects" className="text-primary text-sm inline-flex items-center gap-1 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Projects</Link>

      <div className="clay p-8 mb-6">
        <div className="flex items-start gap-5">
          <div className="clay-sm w-20 h-20 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-9 h-9 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text">{p.name}</h1>
            {p.client && <p className="text-textSecondary">Client: {p.client}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {p.status && (
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                  p.status === 'active' ? 'bg-successSoft text-success' :
                  p.status === 'completed' ? 'bg-infoSoft text-info' :
                  'bg-warningSoft text-warning'
                }`}>{p.status}</span>
              )}
              {p.priority && (
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                  p.priority === 'high' ? 'bg-dangerSoft text-danger' :
                  'bg-warningSoft text-warning'
                }`}>{p.priority}</span>
              )}
            </div>
          </div>
        </div>
        {p.description && <p className="text-sm text-textSecondary mt-6 leading-relaxed whitespace-pre-wrap">{p.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, value], i) => (
          <div key={i} className="clay-sm p-4">
            <div className="text-xs text-textMuted uppercase tracking-wide font-semibold">{label as string}</div>
            <div className="text-text font-medium mt-1 capitalize">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
