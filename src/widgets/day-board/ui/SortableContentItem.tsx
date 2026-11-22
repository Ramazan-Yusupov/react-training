import type { ReactNode } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { PlanContentOrderItem } from '@/entities/plan';

import { FaGripVertical } from 'react-icons/fa6';

interface SortableContentItemProps {
  item: PlanContentOrderItem;
  children: ReactNode;
}

export function getContentSortableId(item: PlanContentOrderItem) {
  return `${item.type}:${item.id}`;
}

export function SortableContentItem({ item, children }: SortableContentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getContentSortableId(item),
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
      }}
      className="relative min-w-0"
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Перетащить элемент"
        title="Перетащить"
        className="absolute left-2 top-3 z-20 flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md text-slate-500 transition hover:bg-white/10 hover:text-blue-400 active:cursor-grabbing"
      >
        <FaGripVertical size={16} />
      </button>

      {children}
    </div>
  );
}
