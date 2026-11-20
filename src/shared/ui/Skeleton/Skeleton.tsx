import { cn } from '@/shared/lib';

interface SkeletonProps {
  className?: string;
}

/** Заглушка на время загрузки: размеры задаются через className (h-6 w-40 и т.п.). */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-white/10', className)} />
  );
}
