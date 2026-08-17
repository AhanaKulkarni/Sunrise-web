'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUser, clearSession, useUser } from '@/lib/auth';
import { LayoutDashboard, CalendarDays, Users, Cpu, Briefcase, Sparkles, LogOut, Sun, Search, Calendar, Bell } from 'lucide-react';

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

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });

  return (
    <div className="h-screen flex p-4 gap-6 bg-[var(--clay-bg)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] flex flex-col clay relative overflow-hidden shrink-0">
        <div className="p-6 flex flex-col gap-2 flex-1 relative z-10 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Sun className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-text uppercase tracking-wider text-sm">Sunrise OS</div>
              <div className="text-[10px] text-textMuted uppercase font-semibold">AetherBuilt</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
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

          {/* User card in sidebar */}
          <div className="clay-sm p-4 mt-auto bg-white/80 backdrop-blur">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-warningSoft text-warning rounded-full flex items-center justify-center font-bold text-sm mb-3">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <button onClick={logout} className="p-1.5 text-danger hover:bg-dangerSoft rounded-lg transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="font-bold text-text text-sm truncate">
              {user?.name || '—'}
            </div>
            <div className="text-[10px] text-textSecondary uppercase tracking-wide font-semibold mt-0.5">
              {user?.role?.replace('_', ' ') || ''} {user?.is_super_admin && '(Super Admin)'}
            </div>
          </div>
        </div>

        {/* Decorative Sun */}
        <div className="absolute bottom-0 left-0 w-full h-48 pointer-events-none opacity-60 flex justify-center items-end">
          <div className="w-40 h-40 bg-gradient-to-t from-yellow-300 to-yellow-500 rounded-full translate-y-24 shadow-[0_0_60px_rgba(251,191,36,0.6)]" />
          <svg className="absolute bottom-0 w-full h-16 text-white" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,234.7C672,235,768,213,864,213.3C960,213,1056,235,1152,245.3C1248,256,1344,256,1392,256L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-text">Good Morning, {user?.name ? user.name.split(' ')[0] : 'User'} <span className="ml-1">👋</span></h1>
            <p className="text-sm text-textSecondary mt-1">Here's a live overview of your factory operations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search anything... ⌘K" className="w-full bg-white rounded-full py-2.5 pl-11 pr-4 text-xs font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] outline-none focus:ring-2 ring-primary/20 transition-shadow text-text placeholder:text-textMuted" />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full py-2.5 px-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-xs font-semibold text-text">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{todayStr}</span>
            </div>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-textSecondary relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-warning rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-successSoft text-success rounded-full flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'admin'}&backgroundColor=e5e7eb`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto pb-8 pr-2 custom-scrollbar">
          <div className="max-w-[1400px] w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
