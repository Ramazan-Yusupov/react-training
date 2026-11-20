import { Skeleton } from '@/shared/ui';

/** Показывается, пока подгружается код страницы. */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
