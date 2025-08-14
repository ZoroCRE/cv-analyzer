import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

export function StatCard({ title, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="p-5 bg-white rounded-lg shadow-md flex items-center dark:bg-dark-surface">
      <div className={`p-3 rounded-full text-white ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="ml-4 rtl:mr-4">
        <p className="text-sm font-medium text-neutral-500 dark:text-dark-subtle truncate">{title}</p>
        <p className="text-2xl font-semibold text-neutral-900 dark:text-dark-text">{value}</p>
      </div>
    </div>
  );
}