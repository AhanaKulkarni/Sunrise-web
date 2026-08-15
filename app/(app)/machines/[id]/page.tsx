'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Cpu } from 'lucide-react';

export default function MachineDetail() {
  const { id } = useParams() as { id: string };
  const [m, setM] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>(`/machines/${id}`).then(setM).catch(async () => {
      // fallback: list + find
      try {
        const list = await api.get<any[]>('/machines');
        setM((list || []).find((x: any) => x.id === id) || null);
      } catch { setM(null); }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="clay p-12 text-center text-textMuted">Loading…</div>;
  if (!m) return (
    <div>
      <Link href="/machines" className="text-primary text-sm inline-flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="clay p-12 text-center text-textMuted">Machine not found.</div>
    </div>
  );

  const fields = [
    ['Model', m.model], ['Serial', m.serial_no], ['Location', m.location],
    ['Status', m.status], ['Category', m.category], ['Manufacturer', m.manufacturer],
    ['Purchase Date', m.purchase_date], ['Last Maintenance', m.last_maintenance],
    ['Next Maintenance', m.next_maintenance], ['Hours Run', m.hours_run],
  ].filter((f) => f[1]);

  return (
    <div>
      <Link href="/machines" className="text-primary text-sm inline-flex items-center gap-1 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Machines</Link>

      <div className="clay p-8 mb-6">
        <div className="flex items-start gap-5">
          <div className="clay-sm w-20 h-20 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-9 h-9 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text">{m.name || 'Unnamed Machine'}</h1>
            <p className="text-textSecondary">{m.model || '—'}</p>
            <div className="flex gap-2 mt-3">
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                m.status === 'running' ? 'bg-successSoft text-success' :
                m.status === 'maintenance' ? 'bg-warningSoft text-warning' :
                'bg-infoSoft text-info'
              }`}>{m.status || 'unknown'}</span>
            </div>
          </div>
        </div>
        {m.description && <p className="text-sm text-textSecondary mt-6 leading-relaxed">{m.description}</p>}
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
