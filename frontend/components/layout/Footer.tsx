import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

const LINKS = {
  Product:  [
    { label: 'Browse Products', href: '/products'  },
    { label: 'Categories',      href: '/categories' },
    { label: 'Write a Review',  href: '/register'   },
    { label: 'Dashboard',       href: '/dashboard'  },
  ],
  Company:  [
    { label: 'Privacy Policy',  href: '/privacy' },
    { label: 'Terms of Service',href: '/terms'   },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-[var(--primary)] bg-[var(--primary)] text-sm font-black text-white">
                RH
              </div>
              <div>
                <span className="block text-[15px] font-black tracking-tight text-[var(--foreground)]">ReviewHub</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Product evidence</span>
              </div>
            </Link>
            <p className="max-w-[260px] text-sm leading-relaxed text-[var(--muted)]">
              Product reviews organized around evidence, verification, and moderation transparency.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Github,  href: 'https://github.com',  label: 'GitHub'  },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.15em] text-[var(--muted)]">{group}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 xs:flex-row">
          <p className="text-xs text-[var(--muted)]">
            &copy; {year} ReviewHub. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
