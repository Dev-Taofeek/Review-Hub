import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-shimmer',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl trust-card p-5">
      <Skeleton className="aspect-square w-full rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <Skeleton className="h-5 w-1/3 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-2xl trust-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
