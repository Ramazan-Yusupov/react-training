import { cn } from '@/shared/lib';
import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const autoId = useId();
    const switchId = id ?? autoId;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex w-full items-center gap-3 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className="relative flex shrink-0">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              'h-6 w-11 rounded-full bg-white/20 p-0.5 transition-colors',
              'peer-checked:bg-blue-500',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50',
              '[&>span]:block [&>span]:h-5 [&>span]:w-5 [&>span]:rounded-full [&>span]:bg-white [&>span]:transition-transform',
              'peer-checked:[&>span]:translate-x-5',
            )}
          >
            <span />
          </span>
        </span>

        {(label || description) && (
          <span className="flex flex-col">
            {label && <span className="text-white">{label}</span>}
            {description && <span className="text-xs text-gray-400">{description}</span>}
          </span>
        )}
      </label>
    );
  },
);
