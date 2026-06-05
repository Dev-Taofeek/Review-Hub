'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  duration = 1.2,
}: AnimatedCounterProps) {
  const reduced    = useReducedMotion();
  const motionVal  = useMotionValue(reduced ? value : 0);
  const springVal  = useSpring(motionVal, {
    stiffness: reduced ? 999 : 60,
    damping:   reduced ? 30  : 14,
    duration,
  });
  const display    = useTransform(springVal, (v) =>
    `${prefix}${v.toFixed(decimals)}${suffix}`
  );
  const mounted    = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Small delay so the card enters first, then the number counts
      setTimeout(() => { motionVal.set(value); }, 200);
    } else {
      motionVal.set(value);
    }
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}
