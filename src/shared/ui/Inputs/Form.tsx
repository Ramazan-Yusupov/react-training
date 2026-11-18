import { cn } from '@/shared/lib';
import { type FormHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Typography } from '../Typography/Typography';

interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'title'> {
  className?: string;
  title?: string;
  actions?: ReactNode;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, title, actions, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-4 border-2 border-white/50 p-4 text-white rounded-xl', className)}
        {...props}
      >
        {title && <Typography as="h5" align="start" text={title} />}
        {children}
        {actions && <div className="flex items-center justify-end gap-2">{actions}</div>}
      </form>
    );
  },
);
