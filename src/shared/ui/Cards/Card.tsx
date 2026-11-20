import { cn } from '@/shared/lib';
import type { KeyboardEvent, ReactNode } from 'react';
import { Badge } from '../Badge/Badge';

type CardMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

interface CardProps {
  title?: string;
  border?: string;
  rounded?: string;
  maxWidth?: CardMaxWidth;
  maxHeight?: string;
  className?: string;
  borderColor?: string;
  classNameChild?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}

const maxWidthClass: Record<CardMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function Card({
  title,
  children,
  maxWidth,
  maxHeight,
  className,
  classNameChild,
  headerRight,
  footer,
  onClick,
  border = '0px',
  rounded = '16px',
  borderColor = 'currentColor',
}: CardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className={cn(maxWidth && maxWidthClass[maxWidth])}>
      <div
        className={cn('flex flex-col gap-4 p-2', onClick && 'cursor-pointer', className)}
        style={{
          border: `${border} solid ${borderColor}`,
          borderRadius: rounded,
          maxHeight: maxHeight,
        }}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {(title || headerRight) && (
          <div className="flex-between gap-3">
            {title ? <Badge text={title} /> : <span />}
            {headerRight}
          </div>
        )}
        <div className={cn('flex flex-col gap-4 overflow-hidden scrollbar-none', classNameChild)}>
          {children}
        </div>
        {footer && <div className="flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
