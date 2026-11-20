import { Toaster } from '@/shared/ui';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
}
