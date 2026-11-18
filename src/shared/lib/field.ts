import type { ReactNode } from 'react';

/** Связывает поле с текстом ошибки или подсказки через aria-describedby. */
export function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
