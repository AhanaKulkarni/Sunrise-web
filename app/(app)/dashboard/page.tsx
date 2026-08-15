'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth';
import { Users, Cpu, Briefcase, CalendarDays, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const user = useUser();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [emp, mach, proj] = await Promise.all([
          api.get('/employees').catch(() => []),
          api.get('/machines').catch(() => []),
          api.get('/projects').catch(() => []),
        ]);
        setStats({
          employees: Array.isArray(emp) ? emp.length : 0,
          activeEmp: Array.isArray(emp) ? emp.filter((e: any) => e.is_active !== false).length : 0,
          machines: Array.isArray(mach) ? mach.length : 0,
          projects: Array.isArray(proj) ? proj.length : 0,
          activeProj: Array.isArray(proj) ? proj.filter((p: any) => p.status !== 'completed' && p.status !== 'archived').length : 0,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: 'Employees', value: stats.employees, sub: `${stats.activeEmp} active`, icon: Users, color: 'text-info', href: '/employees' },
    { label: 'Machines', value: stats.machines, sub: 'in inventory', icon: Cpu, color: 'text-primary', href: '/machines' },
    { label: 'Projects', value: stats.projects, sub: `${stats.activeProj} active`, icon: Briefcase, color: 'text-success', href: '/projects' },
    { label: 'Attendance', value: '—', sub: 'view reports', icon: CalendarDays, color: 'text-warning', href: '/attendance' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-1">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-textSecondary">
          Here&apos;s a snapshot of your operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className="clay p-6 hover:shadow-clay-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="clay-sm w-11 h-11 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${c.color}`} strokeWidth={2.2} />
                </div>
                <TrendingUp className="w-4 h-4 text-textMuted" />
              </div>
              <div className="text-3xl font-bold text-text mb-1">
                {loading ? '—' : c.value}
              </div>
              <div className="text-xs text-textSecondary uppercase tracking-wide font-semibold">
                {c.label}
              </div>
              <div className="text-xs text-textMuted mt-1">{c.sub}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="clay p-6">
          <h3 className="font-bold text-text mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/attendance" className="block clay-sm p-4 hover:shadow-clay transition-shadow">
              <div className="font-semibold text-sm text-text">Download Attendance Report</div>
              <div className="text-xs text-textSecondary mt-0.5">Daily / Weekly / Monthly / Quarterly / Yearly PDF</div>
            </Link>
            <Link href="/employees" className="block clay-sm p-4 hover:shadow-clay transition-shadow">
              <div className="font-semibold text-sm text-text">Browse Employees</div>
              <div className="text-xs text-textSecondary mt-0.5">View directory &amp; profiles</div>
            </Link>
            <Link href="/ai" className="block clay-sm p-4 hover:shadow-clay transition-shadow">
              <div className="font-semibold text-sm text-text">Ask Aether Copilot</div>
              <div className="text-xs text-textSecondary mt-0.5">AI assistant for operations</div>
            </Link>
          </div>
        </div>

        <div className="clay p-6">
          <h3 className="font-bold text-text mb-4">Your Role</h3>
          <div className="clay-inset p-5">
            <div className="text-xs text-textMuted uppercase tracking-wide">Role</div>
            <div className="text-lg font-semibold text-text capitalize mt-1">
              {user?.role?.replace('_', ' ') || '—'}
              {user?.is_super_admin && <span className="ml-2 text-xs text-primary">(Super Admin)</span>}
            </div>
            {user?.department && (
              <>
                <div className="text-xs text-textMuted uppercase tracking-wide mt-4">Department</div>
                <div className="text-sm text-text mt-1">{user.department}</div>
              </>
            )}
            {user?.designation && (
              <>
                <div className="text-xs text-textMuted uppercase tracking-wide mt-4">Designation</div>
                <div className="text-sm text-text mt-1">{user.designation}</div>
              </>
            )}
          </div>
          <p className="text-xs text-textMuted mt-4">
            Attendance marking is available on the mobile app. This web console is for reports, admin, and operations.
          </p>
        </div>
      </div>
    </div>
  );
}
