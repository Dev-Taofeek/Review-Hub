'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const AUTH_ROUTES = ['/login', '/register'];

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced  = useReducedMotion();
  const isAuth   = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  const pageVariants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      y: reduced ? 0 : -6,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  if (isAuth) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          id="main-content"
          className="flex-1"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    );
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          id="main-content"
          className="flex-1"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
