import { cn } from '@/shared/lib';
import { type ReactNode, useId } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId();

  return (
    <span className={cn('group relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-30 w-max max-w-60 -translate-x-1/2 rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs text-gray-200 opacity-0 shadow-lg transition-opacity',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  );
}
