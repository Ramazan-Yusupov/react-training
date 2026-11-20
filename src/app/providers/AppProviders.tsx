import { ScrollToTop } from '@/shared/hooks/useScrollToTop';
import { Toaster } from '@/shared/ui';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {children}
      <Toaster />
    </BrowserRouter>
  );
}
