import { ScrollToTop } from '@/shared/hooks/useScrollToTop';
import { AccountWorkspace } from '@/features/account';
import { Toaster } from '@/shared/ui';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AccountWorkspace>{children}</AccountWorkspace>
      <Toaster />
    </BrowserRouter>
  );
}
