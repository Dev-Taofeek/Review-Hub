import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { container: 'h-6 w-6',  text: 'text-[10px]' },
  sm: { container: 'h-8 w-8',  text: 'text-xs'     },
  md: { container: 'h-10 w-10', text: 'text-sm'    },
  lg: { container: 'h-12 w-12', text: 'text-base'  },
  xl: { container: 'h-16 w-16', text: 'text-lg'    },
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { container, text } = sizes[size];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600',
        container,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? 'Avatar'}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-semibold text-white',
            text
          )}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
