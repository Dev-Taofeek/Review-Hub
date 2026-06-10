'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping:   30,
    restDelta: 0.001,
  });
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{
        scaleX,
        height: '2px',
        background: 'var(--primary)',
        boxShadow: '0 0 8px rgba(0,229,160,0.6)',
      }}
      aria-hidden="true"
    />
  );
}
