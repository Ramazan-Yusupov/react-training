import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';

export type CalendarStatus = 'done' | 'partial' | 'missed' | 'rest' | 'future';

export interface CalendarCell {
  value: number;
  label?: ReactNode;
  status?: CalendarStatus;
  hint?: string;
  disabled?: boolean;
}

interface CalendarProps {
  cells: CalendarCell[];
  selected?: number;
  today?: number;
  onSelect?: (value: number) => void;
  /** Сколько пустых ячеек перед первой (чтобы день попал под нужный день недели) */
  leading?: number;
  weekdays?: readonly string[];
  className?: string;
}

const statusStyles: Record<CalendarStatus, string> = {
  done: 'border-green-500/40 bg-green-500/20 text-green-300',
  partial: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-300',
  missed: 'border-red-500/30 text-red-300',
  rest: 'border-white/10 text-gray-500',
  future: 'border-white/10 text-gray-400',
};

/** Сетка дней плана (7 колонок). */
export function Calendar({
  cells,
  selected,
  today,
  onSelect,
  leading = 0,
  weekdays,
  className,
}: CalendarProps) {
  return (
    <div className={cn('grid grid-cols-7 gap-1.5 p-1', className)}>
      {weekdays?.map((weekday) => (
        <span key={weekday} className="pb-1 text-center text-[10px] text-gray-500">
          {weekday}
        </span>
      ))}
      {Array.from({ length: leading }, (_, index) => (
        <span key={`empty-${index}`} aria-hidden="true" />
      ))}
      {cells.map((cell) => (
        <button
          key={cell.value}
          type="button"
          disabled={cell.disabled}
          aria-label={`День ${cell.value}`}
          aria-pressed={selected === cell.value}
          title={cell.hint}
          onClick={() => onSelect?.(cell.value)}
          className={cn(
            'flex-center aspect-square rounded-lg border text-xs outline-none transition-colors',
            'hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-40',
            statusStyles[cell.status ?? 'future'],
            today === cell.value && 'border-blue-500 text-blue-300',
            selected === cell.value && 'ring-2 ring-blue-500',
          )}
        >
          {cell.label ?? cell.value}
        </button>
      ))}
    </div>
  );
}
