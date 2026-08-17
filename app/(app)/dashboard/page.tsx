'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth';
import { Users, Cpu, Briefcase, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          // Generate a slightly different fake chart curve for each card
          const paths = [
            "M0,30 Q15,5 30,15 T60,10 T90,20 T100,5",
            "M0,20 Q20,30 40,15 T80,10 T100,25",
            "M0,15 Q25,5 50,20 T85,15 T100,10",
            "M0,10 Q20,25 50,15 T80,25 T100,5"
          ];
          const path = paths[i % paths.length];

          return (
            <Link key={c.label} href={c.href} className="clay p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_40px_-10px_rgba(245,158,11,0.15)] transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-[0_4px_10px_rgba(0,0,0,0.06)] relative z-10">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${c.color.replace('text-', 'bg-')}`}></div>
                  <Icon className={`w-6 h-6 ${c.color} relative z-10`} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-4xl font-extrabold text-text tracking-tight mb-0.5">
                    {loading ? '—' : c.value}
                  </div>
                  <div className="text-sm font-semibold text-textSecondary">
                    {c.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold mt-6 relative z-10">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="text-success">{c.sub}</span>
              </div>
              
              {/* Fake chart SVG at bottom */}
              <div className="absolute bottom-0 left-0 w-full h-12 opacity-60 group-hover:opacity-100 transition-opacity">
                 <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-warning/80">
                   <path d={`${path} L100,30 L0,30 Z`} fill="currentColor" className="opacity-10" />
                   <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                 </svg>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="clay p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-warning" />
               Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <Link href="/attendance" className="block p-4 rounded-xl border border-divider/40 hover:border-warning/30 hover:bg-warningSoft/20 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-text group-hover:text-warning transition-colors">Download Attendance Report</div>
                  <div className="text-xs text-textSecondary mt-1">Daily / Weekly / Monthly / Quarterly PDF</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </Link>
            <Link href="/employees" className="block p-4 rounded-xl border border-divider/40 hover:border-warning/30 hover:bg-warningSoft/20 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-text group-hover:text-warning transition-colors">Browse Employees</div>
                  <div className="text-xs text-textSecondary mt-1">View directory &amp; profiles</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </Link>
            <Link href="/ai" className="block p-4 rounded-xl border border-warning/20 bg-gradient-to-r from-warningSoft/30 to-transparent hover:border-warning/50 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-warning flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Ask Aether Copilot
                  </div>
                  <div className="text-xs text-textSecondary mt-1">Your AI assistant for smarter operations</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="clay p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Your Role Profile
            </h3>
            <button className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-textSecondary px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Edit</button>
          </div>
          
          <div className="clay-inset p-6 bg-white border border-divider/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warningSoft rounded-full blur-3xl opacity-30 -translate-y-10 translate-x-10 pointer-events-none"></div>
            
            <div className="flex flex-col gap-5 relative z-10">
              <div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-1">Role</div>
                <div className="text-lg font-bold text-text capitalize flex items-center gap-2">
                  {user?.role?.replace('_', ' ') || '—'}
                  {user?.is_super_admin && <span className="px-2 py-0.5 rounded-md bg-primarySoft text-primary text-[10px] uppercase tracking-wide">Super Admin</span>}
                </div>
              </div>
              
              {user?.department && (
                <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-1">Department</div>
                  <div className="text-sm font-semibold text-text">{user.department}</div>
                </div>
              )}
              
              {user?.designation && (
                <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold mb-1">Designation</div>
                  <div className="text-sm font-semibold text-text">{user.designation}</div>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-textMuted mt-5 leading-relaxed bg-gray-50 p-4 rounded-xl border border-divider/30">
            Attendance marking is available on the mobile app. This web console is for reports, admin, and operations.
          </p>
        </div>
      </div>
    </div>
  );
}
