import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';

type TypographyTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
type TextAlign = 'start' | 'center' | 'end';
type TextTone = 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'accent';

interface TypographyProps {
  as?: TypographyTag;
  text?: string | number;
  children?: ReactNode;
  className?: string;
  align?: TextAlign;
  tone?: TextTone;
}

const typographyStyles: Record<TypographyTag, string> = {
  h1: 'text-4xl font-bold leading-tight md:text-5xl',
  h2: 'text-3xl font-bold leading-tight md:text-4xl',
  h3: 'text-2xl font-semibold leading-snug md:text-3xl',
  h4: 'text-xl font-semibold leading-snug md:text-2xl',
  h5: 'text-lg font-medium leading-normal',
  h6: 'text-base font-medium leading-normal',
  p: 'text-base leading-relaxed',
  span: 'text-sm',
};

const alignStyles: Record<TextAlign, string> = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right',
};

const toneStyles: Record<TextTone, string> = {
  default: '',
  muted: 'text-gray-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
  accent: 'text-blue-400',
};

export function Typography({
  as: Component = 'p',
  text,
  children,
  className,
  align = 'center',
  tone = 'default',
}: TypographyProps) {
  return (
    <Component
      className={cn(typographyStyles[Component], alignStyles[align], toneStyles[tone], className)}
    >
      {text ?? children}
    </Component>
  );
}
