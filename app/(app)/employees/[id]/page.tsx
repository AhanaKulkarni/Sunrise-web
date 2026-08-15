'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, User, Phone, Building2, Briefcase } from 'lucide-react';

export default function EmployeeDetail() {
  const params = useParams();
  const id = String(params?.id);
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.get<any[]>('/employees');
        const found = (list || []).find((e) => e.id === id);
        setEmp(found || null);
      } catch {
        setEmp(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="clay p-12 text-center text-textMuted">Loading…</div>;
  if (!emp) {
    return (
      <div>
        <Link href="/employees" className="text-primary text-sm inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="clay p-12 text-center text-textMuted">Employee not found.</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/employees" className="text-primary text-sm inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      <div className="clay p-8 mb-6">
        <div className="flex items-start gap-5">
          <div className="clay-sm w-20 h-20 flex items-center justify-center flex-shrink-0">
            <User className="w-9 h-9 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text">{emp.name}</h1>
            <p className="text-textSecondary">{emp.designation || '—'}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {emp.is_active === false ? (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-dangerSoft text-danger font-semibold">Inactive</span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-successSoft text-success font-semibold">Active</span>
              )}
              {emp.face_enrolled && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-infoSoft text-info font-semibold">Face Enrolled</span>
              )}
              {emp.is_super_admin && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-warningSoft text-warning font-semibold">Super Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Phone', value: emp.phone, icon: Phone },
          { label: 'Department', value: emp.department, icon: Building2 },
          { label: 'Role', value: emp.role?.replace('_', ' '), icon: Briefcase },
          { label: 'Shift', value: emp.shift, icon: Briefcase },
          { label: 'Employee ID', value: emp.id, icon: User },
        ]
          .filter((f) => f.value)
          .map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="clay-sm p-5 flex items-start gap-4">
                <Icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="text-xs text-textMuted uppercase tracking-wide font-semibold">
                    {f.label}
                  </div>
                  <div className="text-text font-medium mt-1 capitalize">{f.value}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
