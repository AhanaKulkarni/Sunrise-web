'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, User } from 'lucide-react';

type Emp = {
  id: string;
  name: string;
  phone?: string;
  department?: string;
  designation?: string;
  role?: string;
  is_active?: boolean;
  face_enrolled?: boolean;
};

export default function EmployeesList() {
  const [rows, setRows] = useState<Emp[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Emp[]>('/employees');
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.name?.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.department?.toLowerCase().includes(s) ||
      r.designation?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Employees</h1>
          <p className="text-textSecondary">
            {rows.length} employees · {rows.filter((r) => r.is_active !== false).length} active
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, department…"
            className="clay-input pl-11 w-80"
          />
        </div>
      </div>

      {error && <div className="clay-sm p-4 mb-4 text-danger">{error}</div>}

      {loading ? (
        <div className="clay p-12 text-center text-textMuted">Loading employees…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Link
              key={e.id}
              href={`/employees/${e.id}`}
              className="clay p-5 hover:shadow-clay-hover transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="clay-sm w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text truncate">{e.name}</div>
                  <div className="text-xs text-textSecondary truncate">
                    {e.designation || '—'}
                  </div>
                  <div className="text-xs text-textMuted truncate mt-0.5">
                    {e.department || '—'}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {e.is_active === false ? (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-dangerSoft text-danger font-medium">
                        Inactive
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-successSoft text-success font-medium">
                        Active
                      </span>
                    )}
                    {e.face_enrolled && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-infoSoft text-info font-medium">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full clay p-12 text-center text-textMuted">
              No employees match &quot;{q}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
