'use client';

import { Navbar } from 'flowbite-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthStatus } from '@/components/auth';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <Navbar fluid className="border-b">
      <Navbar.Brand as={Link} href="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Receipts App
        </span>
      </Navbar.Brand>
      <div className="flex items-center gap-4 md:order-2">
        <AuthStatus />
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link
          as={Link}
          href="/"
          active={isActive('/')}
        >
          Receipts
        </Navbar.Link>
        <Navbar.Link
          as={Link}
          href="/admin/price-proofs"
          active={isActive('/admin')}
        >
          Price Proofs
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
