import { Navigation } from '@/widgets/navigation';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageSkeleton } from './PageSkeleton';

export function AppLayout() {
  return (
    <>
      <Navigation />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:pb-10 md:pt-24">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
