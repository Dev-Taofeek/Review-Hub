import Link from 'next/link';
import { Star, Github, Twitter } from 'lucide-react';

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
    <footer className="mt-auto border-t border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#0c1526]">
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-900/25 group-hover:shadow-brand-900/40 transition-shadow">
                <Star className="h-4.5 w-4.5 fill-white text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white block">ReviewHub</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-400">Verified Reviews</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px]">
              The most trusted platform for honest product reviews. Community-built, spam-free.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Github,  href: 'https://github.com',  label: 'GitHub'  },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col xs:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            &copy; {year} ReviewHub. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
