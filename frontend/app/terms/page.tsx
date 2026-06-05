import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ReviewHub Terms of Service — the rules and guidelines for using our platform.',
};

const LAST_UPDATED = 'June 1, 2026';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using ReviewHub ("the Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of these Terms, you must not use the Service. We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes your acceptance of the revised Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 13 years old to use ReviewHub. By using the Service, you represent that you meet this requirement. If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    bullets: [
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You are responsible for all activity that occurs under your account.',
      'You must provide accurate and complete information when creating your account.',
      'You may not use another user\'s account without permission.',
      'You must notify us immediately at support@reviewhub.com if you suspect unauthorised access to your account.',
      'We reserve the right to suspend or terminate accounts that violate these Terms.',
    ],
  },
  {
    id: 'content',
    title: '4. User Content',
    subsections: [
      {
        title: '4.1 Your Reviews and Submissions',
        content: [
          'You retain ownership of the content you submit, including reviews, ratings, and images ("User Content").',
          'By submitting User Content, you grant ReviewHub a worldwide, non-exclusive, royalty-free, sublicensable licence to use, reproduce, display, distribute, and modify your content in connection with operating the Service.',
          'You are solely responsible for the accuracy and legality of your User Content.',
        ],
      },
      {
        title: '4.2 Content Standards',
        content: [
          'Reviews must reflect your genuine, first-hand experience with a product.',
          'Content must not be false, misleading, defamatory, or fraudulent.',
          'Content must not infringe any third-party intellectual property or privacy rights.',
          'Content must not contain spam, advertising, or promotional material unrelated to the review.',
          'Content must not include hate speech, harassment, or threatening language.',
          'Content must not contain personal information of other individuals without their consent.',
        ],
      },
      {
        title: '4.3 Content Moderation',
        content: [
          'ReviewHub reserves the right to review, edit, or remove any User Content that violates these Terms or our Community Guidelines.',
          'Automated spam detection may flag or hold reviews for manual review.',
          'You may report content that violates these Terms using the in-app reporting feature.',
        ],
      },
    ],
  },
  {
    id: 'prohibited',
    title: '5. Prohibited Conduct',
    content: 'You agree not to:',
    bullets: [
      'Submit fake, incentivised, or compensated reviews without clear disclosure.',
      'Manipulate ratings or reviews through coordinated campaigns ("review bombing").',
      'Use automated tools, bots, or scripts to interact with the Service.',
      'Attempt to reverse-engineer, scrape, or exploit the platform.',
      'Impersonate any person or entity, including ReviewHub staff.',
      'Circumvent any security measures or access controls.',
      'Use the Service for any unlawful purpose or in violation of any applicable law.',
      'Interfere with or disrupt the integrity or performance of the Service.',
    ],
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    content: `The Service and its original content, features, and functionality — excluding User Content — are and remain the exclusive property of ReviewHub, Inc. and its licensors. Our trademarks, logos, and service marks may not be used without our prior written consent. All rights not expressly granted are reserved.`,
  },
  {
    id: 'third-party',
    title: '7. Third-Party Services',
    content: `The Service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites. Linking to a third party does not imply endorsement. We encourage you to review the terms and privacy policies of any third-party services you visit.`,
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimers',
    content: `The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. ReviewHub does not warrant that the Service will be uninterrupted, error-free, or free of viruses. We do not endorse or verify the accuracy of any reviews, ratings, or product information submitted by users. Product reviews represent the opinions of individual users and not of ReviewHub.`,
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, ReviewHub, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising from your use of the Service. In no event shall our total liability to you exceed the greater of (a) $100 USD or (b) the amounts you paid to ReviewHub in the past 12 months, if any.`,
  },
  {
    id: 'indemnification',
    title: '10. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless ReviewHub and its officers, directors, employees, and agents from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your use of the Service, your User Content, or your violation of these Terms.`,
  },
  {
    id: 'termination',
    title: '11. Termination',
    content: `We may suspend or terminate your account and access to the Service at our sole discretion, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination will survive, including ownership provisions, warranty disclaimers, and limitations of liability. You may delete your account at any time from the profile settings page.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law and Disputes',
    content: `These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to conflict of law principles. Any disputes arising under these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be subject to binding arbitration or, where not permitted, the exclusive jurisdiction of the courts in the applicable jurisdiction.`,
  },
  {
    id: 'changes',
    title: '13. Changes to These Terms',
    content: `We reserve the right to modify these Terms at any time. We will provide at least 14 days' notice for material changes by emailing registered users or displaying a prominent notice on the Service. Your continued use of the Service after the effective date of any revision constitutes your acceptance of the new Terms.`,
  },
  {
    id: 'contact',
    title: '14. Contact',
    content: `If you have questions about these Terms, please contact us:`,
    contact: { address: 'ReviewHub, Inc.\nAttn: Legal Team\nlegal@reviewhub.com' },
  },
];

export default function TermsPage() {
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
            <span className="text-gray-300 text-sm">Terms of Service</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-gray-400 mt-1">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sticky TOC */}
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
            <div className="rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/20 p-5">
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 mb-2">Please read carefully</p>
              <p className="text-sm text-violet-700 dark:text-violet-400 leading-relaxed">
                By using ReviewHub, you agree to post honest reviews of products you have genuinely used, treat other community members with respect, and follow our content standards. Fake, incentivised, or abusive reviews will result in account termination.
              </p>
            </div>

            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-white/10">
                  {section.title}
                </h2>

                {'content' in section && section.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{section.content}</p>
                )}

                {'subsections' in section && section.subsections?.map((sub) => (
                  <div key={sub.title} className="mb-5">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{sub.title}</h3>
                    <ul className="space-y-1.5">
                      {sub.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {'bullets' in section && section.bullets && (
                  <ul className="space-y-1.5">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {'contact' in section && section.contact && (
                  <div className="mt-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-mono whitespace-pre-line">{section.contact.address}</p>
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
            <Link href="/terms"   className="text-brand-600 dark:text-brand-400 font-medium">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</Link>
            <Link href="/"        className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
