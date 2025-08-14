import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Upload, FileStack, List, Settings, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import Logo from '../assets/logo.svg';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, labelKey: 'navigation.dashboard' },
    { to: '/upload', icon: Upload, labelKey: 'navigation.upload' },
    { to: '/submissions', icon: FileStack, labelKey: 'navigation.submissions' },
    { to: '/keywords', icon: List, labelKey: 'navigation.keywords' },
    { to: '/settings', icon: Settings, labelKey: 'navigation.settings' },
    { to: '/admin', icon: Shield, labelKey: 'navigation.admin', admin: true },
  ];

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-dark-bg">
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-primary text-white">
        <div className="flex flex-col flex-1 h-full">
            <div className="flex items-center justify-center h-20 border-b shrink-0 border-primary-dark">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src={Logo} alt="Logo" className="w-8 h-8"/>
                    <span className="text-xl font-bold">{t('appName')}</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map(item => (
                (!item.admin || isAdmin) && (
                <NavLink key={item.to} to={item.to}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        isActive ? 'bg-primary-dark' : 'text-neutral-200 hover:bg-primary-dark hover:text-white'
                        }`
                    }
                >
                    <item.icon className="w-5 h-5 mr-3 rtl:ml-3" />
                    {t(item.labelKey)}
                </NavLink>
                )
            ))}
            </nav>
            <div className="p-4 border-t border-primary-dark">
            <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md text-neutral-200 hover:bg-primary-dark hover:text-white">
                <LogOut className="w-5 h-5 mr-3 rtl:ml-3" />
                {t('navigation.logout')}
            </button>
            </div>
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-y-auto md:p-8">
        {children}
      </main>
    </div>
  );
}