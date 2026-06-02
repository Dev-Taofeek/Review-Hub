import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Tag } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice, buildProductImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return (
    <Link href={`/products/${product.slug}`}>
      <article
        className={cn(
          'group rounded-2xl border border-slate-100 bg-white shadow-card overflow-hidden',
          'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
          'dark:bg-surface-dark-muted dark:border-white/8',
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-white/5">
          <Image
            src={buildProductImageUrl(primaryImage)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.category?.icon && (
            <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-base shadow-sm backdrop-blur-sm">
              {product.category.icon}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-medium truncate">{product.brand}</span>
            {product.category && (
              <Badge variant="default" size="sm" className="shrink-0">
                <Tag className="h-2.5 w-2.5" />
                {product.category.name}
              </Badge>
            )}
          </div>

          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={product.average_rating} size="sm" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {product.average_rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({product.total_reviews})
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MessageSquare className="h-3.5 w-3.5" />
              {product.total_reviews} reviews
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
