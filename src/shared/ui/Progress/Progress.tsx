import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  valueText?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

const fills = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  valueText,
  color = 'blue',
  size = 'md',
  className,
}: ProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (safeValue / max) * 100 : 0;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex-between gap-3 text-sm">
          <span className="text-gray-300">{label}</span>
          {showValue && (
            <span className="text-gray-400">{valueText ?? `${Math.round(percent)}%`}</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        aria-label={typeof label === 'string' ? label : undefined}
        className={cn('w-full overflow-hidden rounded-full bg-white/10', heights[size])}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', fills[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
