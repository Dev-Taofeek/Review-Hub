import type { Transition, Variants } from 'framer-motion';

export const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;
export const EASE_SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

const base: Transition = { duration: 0.14, ease: EASE_OUT };

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: base },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: base },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: base },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 4 },
  visible: { opacity: 1, x: 0, transition: base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.99 },
  visible: { opacity: 1, scale: 1, transition: base },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.01, delayChildren: 0 } },
};

export const staggerFast: Variants = staggerContainer;
export const staggerSlow: Variants = staggerContainer;

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: base },
};

export const orbFloat = () => ({
  animate: {
    opacity: 0,
    transition: { duration: 0.01, repeat: 0 },
  },
});

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 2 },
  visible: { opacity: 1, y: 0, transition: base },
  exit: { opacity: 0, y: -2, transition: { duration: 0.1 } },
};

export const cardHover = {
  rest: { y: 0, scale: 1, transition: base },
  hover: { y: 0, scale: 1, transition: base },
};

export const buttonTap = { scale: 1 };

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const drawerVariants: Variants = {
  hidden: { opacity: 0, y: -2 },
  visible: { opacity: 1, y: 0, transition: base },
  exit: { opacity: 0, y: -2, transition: { duration: 0.1 } },
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

export const numberSpring = { type: 'spring', stiffness: 140, damping: 32 };

export const reducedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.08 } },
};

export function getVariants(prefersReduced: boolean, full: Variants, reduced: Variants = reducedFadeIn): Variants {
  return prefersReduced ? reduced : full;
}
