import { cn, describedBy } from '@/shared/lib';
import { type ReactNode, type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { Field } from './Field';
import { getFieldClass } from './field.styles';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, wrapperClassName, options, placeholder, label, hint, error, id, ...props },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
      <Field id={selectId} label={label} hint={hint} error={error} className={wrapperClassName}>
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(selectId, error, hint)}
            className={cn(
              getFieldClass(Boolean(error)),
              'appearance-none pr-10 cursor-pointer *:bg-neutral-900 *:text-white',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={12}
            className="absolute right-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </Field>
    );
  },
);
