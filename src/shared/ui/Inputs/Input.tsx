import { cn, describedBy } from '@/shared/lib';
import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import { RiCloseCircleFill } from 'react-icons/ri';
import { Field } from './Field';
import { getFieldClass } from './field.styles';

interface CustomInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  error?: string;
  onClear?: () => void;
  wrapperClassName?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, CustomInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type = 'text',
      label,
      hint,
      iconLeft,
      iconRight,
      error,
      onClear,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const isClearable = !!onClear && hasValue && type !== 'checkbox' && type !== 'range';

    return (
      <Field id={inputId} label={label} hint={hint} error={error} className={wrapperClassName}>
        <div className="relative flex items-center w-full">
          {iconLeft && (
            <span className="absolute left-3 text-gray-400 pointer-events-none z-10">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, error, hint)}
            {...props}
            className={cn(
              getFieldClass(Boolean(error)),
              iconLeft && 'pl-10',
              (iconRight || isClearable) && 'pr-10',
              type === 'range' && 'p-0 h-2 accent-slate-500',
              type === 'checkbox' && 'w-5 h-5 accent-slate-500 cursor-pointer',
              className,
            )}
          />

          {isClearable && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors z-10"
              aria-label="Clear input"
            >
              <RiCloseCircleFill size={18} />
            </button>
          )}

          {!isClearable && iconRight && (
            <span className="absolute right-3 text-gray-400 z-10">{iconRight}</span>
          )}
        </div>
      </Field>
    );
  },
);
