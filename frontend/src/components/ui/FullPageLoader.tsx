import { LoaderCircle } from 'lucide-react';

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-dark-bg">
      <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
    </div>
  );
}