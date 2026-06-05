import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ReviewHub Privacy Policy — how we collect, use, and protect your data.',
};

const LAST_UPDATED = 'June 1, 2026';

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `ReviewHub ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at reviewhub.com (the "Service"). Please read this policy carefully. By using ReviewHub, you consent to the practices described here.`,
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    subsections: [
      {
        title: '2.1 Information You Provide',
        content: [
          'Account registration: full name, username, email address, and password.',
          'Profile information: bio, avatar image, and other optional profile details.',
          'Reviews and ratings: product reviews, star ratings, pros/cons, and images you submit.',
          'Communications: messages or support requests you send to us.',
        ],
      },
      {
        title: '2.2 Information Collected Automatically',
        content: [
          'Log data: IP address, browser type, operating system, referring URLs, and pages visited.',
          'Device data: device identifiers, hardware model, and mobile network information.',
          'Usage data: features used, search queries, interactions with reviews, and time spent on the platform.',
          'Cookies and similar technologies: session tokens, preference data, and analytics identifiers.',
        ],
      },
      {
        title: '2.3 Information from Third Parties',
        content: [
          'Authentication providers: if you sign in via a third-party provider, we receive your name and email from that provider.',
          'Analytics services: aggregated and anonymised usage statistics from analytics partners.',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: `We use the information we collect to:`,
    bullets: [
      'Create and manage your account and provide the Service.',
      'Display your profile, reviews, and ratings to other users.',
      'Detect and prevent spam, fraud, abuse, and policy violations.',
      'Send transactional emails such as account confirmations and password resets.',
      'Improve, personalise, and develop the Service.',
      'Respond to your support inquiries.',
      'Comply with legal obligations.',
      'Enforce our Terms of Service.',
    ],
  },
  {
    id: 'sharing',
    title: '4. How We Share Your Information',
    content: `We do not sell your personal information. We may share it in the following circumstances:`,
    bullets: [
      'Public profile data: your username, avatar, and reviews are visible to all visitors by default.',
      'Service providers: trusted vendors (e.g., Supabase for database, Cloudinary for images) that process data on our behalf under strict confidentiality agreements.',
      'Legal requirements: when required by law, court order, or government authority.',
      'Business transfers: in connection with a merger, acquisition, or sale of assets, your data may be transferred with prior notice.',
      'Safety: to protect the rights, property, or safety of ReviewHub, our users, or the public.',
    ],
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention, resolving disputes, enforcing agreements).`,
  },
  {
    id: 'security',
    title: '6. Security',
    content: `We implement industry-standard security measures including encrypted data transmission (TLS), row-level security policies in our database, hashed passwords, and regular security reviews. However, no internet transmission is 100% secure. We encourage you to use a strong, unique password and to contact us immediately if you suspect unauthorised access to your account.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:`,
    bullets: [
      'Access: request a copy of the personal data we hold about you.',
      'Correction: request that we correct inaccurate or incomplete data.',
      'Deletion: request that we delete your personal data ("right to be forgotten").',
      'Portability: request your data in a machine-readable format.',
      'Objection: object to certain processing activities.',
      'Withdraw consent: where processing is based on consent, withdraw it at any time.',
    ],
    afterContent: `To exercise any of these rights, contact us at privacy@reviewhub.com. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    title: '8. Cookies',
    content: `We use essential cookies to operate the Service (e.g., session management and authentication). We do not use advertising or third-party tracking cookies. You may configure your browser to refuse cookies, but this may affect certain features of the Service.`,
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    content: `ReviewHub is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly. If you believe a child under 13 has provided us with personal information, please contact us at privacy@reviewhub.com.`,
  },
  {
    id: 'international',
    title: '10. International Data Transfers',
    content: `ReviewHub operates globally. Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in accordance with applicable law.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by displaying a prominent notice on the Service before the change becomes effective. The "Last Updated" date at the top of this page reflects the most recent revision. Your continued use of the Service after any change constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: `If you have questions or concerns about this Privacy Policy, please contact us:`,
    contact: {
      email: 'privacy@reviewhub.com',
      address: 'ReviewHub, Inc.\nAttn: Privacy Team\nprivacy@reviewhub.com',
    },
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080F]">

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <Star className="h-4 w-4" /> ReviewHub
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 text-sm">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-400 mt-1">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sticky table of contents */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0D1020] shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-xs text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 py-1 border-l-2 border-transparent hover:border-brand-500 pl-2.5 transition-all leading-relaxed">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3 space-y-10">
            {/* Summary box */}
            <div className="rounded-2xl border border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-950/20 p-5">
              <p className="text-sm font-semibold text-brand-800 dark:text-brand-300 mb-2">The short version</p>
              <p className="text-sm text-brand-700 dark:text-brand-400 leading-relaxed">
                We collect only the information needed to run ReviewHub. We never sell your data. Your reviews and public profile are visible to others. You control your data and can delete your account at any time.
              </p>
            </div>

            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-white/10">
                  {section.title}
                </h2>

                {section.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                )}

                {'subsections' in section && section.subsections?.map((sub) => (
                  <div key={sub.title} className="mb-5">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{sub.title}</h3>
                    <ul className="space-y-1.5">
                      {sub.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {'bullets' in section && section.bullets && (
                  <ul className="space-y-1.5 mb-4">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {'afterContent' in section && section.afterContent && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">{section.afterContent}</p>
                )}

                {'contact' in section && section.contact && (
                  <div className="mt-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{section.contact.address}</p>
                  </div>
                )}
              </section>
            ))}
          </main>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ReviewHub, Inc. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/terms"   className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 font-medium">Privacy Policy</Link>
            <Link href="/"        className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
