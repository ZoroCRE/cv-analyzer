import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import Logo from '@/assets/logo.svg';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-20 px-8 bg-white shadow-md dark:bg-dark-surface">
      <Link to="/dashboard" className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="w-8 h-8" />
        <span className="hidden text-xl font-bold md:block">CV-Intellect</span>
      </Link>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold">{user?.profile?.displayName}</div>
          <div className="text-sm text-neutral-600 dark:text-dark-subtle">Credits: {user?.profile?.credits ?? 0}</div>
        </div>
        <button onClick={logout} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}