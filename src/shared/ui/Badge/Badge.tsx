import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';
import { AiFillCloseCircle } from 'react-icons/ai';

type colors = 'gray' | 'white' | 'red' | 'green' | 'blue' | 'yellow';

type BadgeProps = {
  text?: string | number;
  count?: number;
  color?: colors;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  onDelete?: () => void;
  deleteLabel?: string;
};

const colorStyles: Record<colors, string> = {
  white: 'text-white border-white',
  red: 'text-red-600 border-red-600',
  blue: 'text-blue-600 border-blue-600',
  gray: 'text-gray-500 border-gray-500',
  green: 'text-green-600 border-green-600',
  yellow: 'text-yellow-600 border-yellow-600',
};

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
};

export function Badge({
  text,
  count,
  icon,
  className,
  onDelete,
  deleteLabel = 'Remove',
  color = 'gray',
  size = 'md',
}: BadgeProps) {
  const content = [text, count].filter((value) => value !== undefined && value !== '').join(' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-medium w-fit border-2 rounded-lg px-3 py-1 h-min',
        colorStyles[color],
        sizeStyles[size],
        className,
      )}
    >
      {icon}
      {content}
      {onDelete && (
        <button
          type="button"
          aria-label={deleteLabel}
          className="hover:opacity-80"
          onClick={onDelete}
        >
          <AiFillCloseCircle />
        </button>
      )}
    </span>
  );
}
