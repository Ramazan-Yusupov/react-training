import { cn } from '@/shared/lib';
import type { ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/** Раскрывающиеся блоки на нативном <details>: клавиатура и доступность от браузера. */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <details
          key={item.id}
          open={item.defaultOpen}
          className="group rounded-xl border border-white/10"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 [&::-webkit-details-marker]:hidden">
            {item.title}
            <FaChevronDown
              aria-hidden="true"
              className="shrink-0 text-xs text-gray-400 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-300">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
