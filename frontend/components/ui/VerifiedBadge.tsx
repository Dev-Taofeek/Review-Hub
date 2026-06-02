import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  tooltip?: boolean;
}

const sizes = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

export function VerifiedBadge({ size = 'sm', className, tooltip = true }: VerifiedBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      title={tooltip ? 'Verified Reviewer — reviews from this user are trusted by ReviewHub' : undefined}
      aria-label="Verified reviewer"
    >
      {/* Twitter-style blue checkmark circle */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizes[size]}
      >
        {/* Blue circle background */}
        <circle cx="12" cy="12" r="12" fill="#1D9BF0" />
        {/* White checkmark */}
        <path
          d="M9.5 16.5L5.5 12.5L6.91 11.09L9.5 13.67L17.09 6.08L18.5 7.5L9.5 16.5Z"
          fill="white"
          strokeWidth="0"
        />
      </svg>
    </span>
  );
}
