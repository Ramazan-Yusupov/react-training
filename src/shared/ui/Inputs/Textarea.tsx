import { cn, describedBy } from '@/shared/lib';
import { type ReactNode, type TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { Field } from './Field';
import { getFieldClass } from './field.styles';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, wrapperClassName, label, hint, error, id, rows = 3, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;

    return (
      <Field id={textareaId} label={label} hint={hint} error={error} className={wrapperClassName}>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(textareaId, error, hint)}
          className={cn(getFieldClass(Boolean(error)), 'resize-y', className)}
          {...props}
        />
      </Field>
    );
  },
);
