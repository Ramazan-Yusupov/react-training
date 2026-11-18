import { cn } from '@/shared/lib';
import { type KeyboardEvent, type ReactNode, useRef } from 'react';
import { Badge } from '../Badge/Badge';

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({ items, value, onChange, ariaLabel, fullWidth, className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled);
    if (enabled.length === 0) return;

    const current = enabled.findIndex(({ item }) => item.value === value);
    let next = -1;

    if (event.key === 'ArrowRight') next = (current + 1) % enabled.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + enabled.length) % enabled.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;

    if (next === -1) return;
    event.preventDefault();

    const target = enabled[next];
    onChange(target.item.value);
    refs.current[target.index]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex gap-1 rounded-xl border border-white/10 p-1',
        fullWidth ? 'w-full' : 'w-fit',
        className,
      )}
    >
      {items.map((item, index) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
              fullWidth && 'flex-1',
              isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white',
            )}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && <Badge size="sm" text={item.badge} />}
          </button>
        );
      })}
    </div>
  );
}
