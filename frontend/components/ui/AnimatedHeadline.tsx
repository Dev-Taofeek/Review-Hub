'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedHeadlineProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'span';
}

export function AnimatedHeadline({
  children,
  className,
  delay = 0,
  as: Tag = 'span',
}: AnimatedHeadlineProps) {
  const reduced = useReducedMotion();
  const words   = children.split(' ');

  if (reduced) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className} style={{ display: 'block' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.28em] last:mr-0"
          initial={{ opacity: 0, y: 24, rotateX: -15 }}
          animate={{ opacity: 1, y: 0,  rotateX: 0   }}
          transition={{
            duration: 0.55,
            delay:    delay + i * 0.07,
            ease:     [0.34, 1.2, 0.64, 1],
          }}
          style={{ transformPerspective: '800px', backfaceVisibility: 'hidden' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

/* Character-level reveal (for shorter text) */
export function AnimatedChars({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{children}</span>;

  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {children.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{
            duration: 0.35,
            delay:    delay + i * 0.03,
            ease:     [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
