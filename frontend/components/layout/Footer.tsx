import Link from 'next/link';
import { Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-white/8 bg-white dark:bg-surface-dark mt-auto">
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0">
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
              ReviewHub
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Honest reviews from real people. Discover the best products with confidence.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Platform</p>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/products" className="hover:text-gray-900 dark:hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link href="/products/new" className="hover:text-gray-900 dark:hover:text-white transition-colors">Add a Product</Link></li>
              <li><Link href="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">Write a Review</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Account</p>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/dashboard"  className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/profile"    className="hover:text-gray-900 dark:hover:text-white transition-colors">Profile</Link></li>
              <li><Link href="/my-reviews" className="hover:text-gray-900 dark:hover:text-white transition-colors">My Reviews</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Legal</p>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms"   className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 border-t border-gray-100 dark:border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ReviewHub. All rights reserved.</p>
          <p className="text-xs text-gray-400">Built with Next.js &amp; Supabase</p>
        </div>
      </div>
    </footer>
  );
}
