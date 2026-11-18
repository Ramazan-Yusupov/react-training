import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';

export interface FieldProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Подпись, подсказка и ошибка вокруг любого поля ввода. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span id={`${id}-error`} role="alert" className="ml-1 block text-xs text-red-400">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="ml-1 block text-xs text-gray-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
