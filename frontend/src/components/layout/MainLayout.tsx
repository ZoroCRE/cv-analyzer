import React from 'react';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-dark-bg">
      <Header />
      <main className="p-8 pt-24">
        {children}
      </main>
    </div>
  );
}