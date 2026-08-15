'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUser, clearSession, useUser } from '@/lib/auth';
import { LayoutDashboard, CalendarDays, Users, Cpu, Briefcase, Sparkles, LogOut, Sun } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance Reports', icon: CalendarDays },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/machines', label: 'Machines', icon: Cpu },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/ai', label: 'Aether Copilot', icon: Sparkles },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined' && !getUser()) {
      router.replace('/login');
    }
  }, [router]);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 p-6 flex flex-col gap-2 border-r border-divider/50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="clay-sm w-11 h-11 flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold text-text">Sunrise OS</div>
            <div className="text-xs text-textMuted">Web Console</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`clay-nav-link ${active ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="clay-sm p-4 mt-4">
          <div className="text-xs text-textMuted mb-1">Signed in as</div>
          <div className="font-semibold text-text text-sm truncate">
            {user?.name || '—'}
          </div>
          <div className="text-xs text-textSecondary mb-3 capitalize">
            {user?.role?.replace('_', ' ') || ''}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-medium text-danger hover:opacity-70"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
