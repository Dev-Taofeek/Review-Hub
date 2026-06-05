import type { Variants, Transition } from 'framer-motion';

/* ── Shared easing curves ─────────────────────────────── */
export const EASE_OUT    = [0.25, 0.46, 0.45, 0.94] as const;
export const EASE_SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const;

/* ── Base transition ──────────────────────────────────── */
const base: Transition = { duration: 0.45, ease: EASE_OUT };

/* ── Page / section entrance ──────────────────────────── */
export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: base },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: base },
};

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0,  transition: base },
};

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0,  transition: base },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.35, ease: EASE_OUT } },
};

/* ── Stagger containers ────────────────────────────────── */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.0 } },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/* ── Slow stagger (for feature grids, etc.) ──────────── */
export const staggerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

/* ── Orb float (animated background blobs) ───────────── */
export const orbFloat = (delay = 0) => ({
  animate: {
    y:       [0, -22, 0],
    scale:   [1, 1.08, 1],
    opacity: [0.45, 0.65, 0.45],
    transition: {
      duration: 9 + delay,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay,
    },
  },
});

/* ── Page transition ─────────────────────────────────── */
export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.22 } },
};

/* ── Card hover / tap ─────────────────────────────────── */
export const cardHover = {
  rest:  { y: 0,  scale: 1,    transition: { duration: 0.2, ease: 'easeOut' } },
  hover: { y: -5, scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const buttonTap = { scale: 0.97 };

/* ── Modal / overlay ─────────────────────────────────── */
export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.25, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15 } },
};

/* ── Drawer / mobile menu ─────────────────────────────── */
export const drawerVariants: Variants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.2, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ── Dropdown ─────────────────────────────────────────── */
export const dropdownVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.18, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.12 } },
};

/* ── Number counter (use with useMotionValue + animate) ── */
export const numberSpring = { type: 'spring', stiffness: 60, damping: 14 };

/* ── Accessibility: reduced motion variants ───────────── */
export const reducedFadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
};

/** Returns the correct variants depending on prefers-reduced-motion */
export function getVariants(
  prefersReduced: boolean,
  full: Variants,
  reduced: Variants = reducedFadeIn
): Variants {
  return prefersReduced ? reduced : full;
}
