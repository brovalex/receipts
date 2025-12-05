'use client';

import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        <p>Celiac Tax Credit Receipts Tracker</p>
      </footer>
    </div>
  );
}
