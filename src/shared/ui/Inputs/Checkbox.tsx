import { cn } from '@/shared/lib';
import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import { FaCheck } from 'react-icons/fa6';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const boxSizes = {
  sm: 'w-4 h-4 text-[10px]',
  md: 'w-5 h-5 text-xs',
  lg: 'w-6 h-6 text-sm',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, right, size = 'md', id, disabled, ...props }, ref) => {
    const autoId = useId();
    const checkboxId = id ?? autoId;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'flex w-full items-center gap-3 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className="relative flex shrink-0">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              'flex-center rounded-md border-2 border-white/40 text-white transition-colors',
              'peer-checked:border-blue-500 peer-checked:bg-blue-500',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50',
              '[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100',
              boxSizes[size],
            )}
          >
            <FaCheck aria-hidden="true" />
          </span>
        </span>

        {(label || description) && (
          <span className="flex min-w-0 flex-1 flex-col">
            {label && <span className="min-w-0 text-white">{label}</span>}
            {description && <span className="text-xs text-gray-400">{description}</span>}
          </span>
        )}

        {right && <span className="ml-auto shrink-0">{right}</span>}
      </label>
    );
  },
);
