'use client';

import { Navbar } from 'flowbite-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <Navbar.Toggle />
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
        {/* Auth links will be added in Phase 1 */}
        {/* <Navbar.Link href="/settings">Settings</Navbar.Link> */}
      </Navbar.Collapse>
    </Navbar>
  );
}
