'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? {} : staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}
    >
      {icon && (
        <motion.div
          variants={reduced ? {} : staggerItem}
          whileHover={reduced ? {} : { scale: 1.08, rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface-soft)] text-[var(--primary)] shadow-inner"
        >
          <span className="[&>svg]:h-10 [&>svg]:w-10">{icon}</span>
        </motion.div>
      )}
      <motion.h3 variants={reduced ? {} : staggerItem}
        className="mb-2 text-lg font-bold text-[var(--foreground)]">
        {title}
      </motion.h3>
      {description && (
        <motion.p variants={reduced ? {} : staggerItem}
          className="mb-6 max-w-xs text-sm text-[var(--muted)] leading-relaxed">
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div variants={reduced ? {} : staggerItem} whileHover={reduced ? {} : { scale: 1.04 }} whileTap={reduced ? {} : { scale: 0.97 }}>
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
