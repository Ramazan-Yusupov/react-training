import { useState } from 'react';

import {
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem, PlanDay } from '@/entities/plan';

interface UseDayBoardDndProps {
  day: number;
  planDay: PlanDay | undefined;
  contentOrder: PlanContentOrderItem[];
}

interface DragPreviewSize {
  width: number;
  height: number;
}

export function useDayBoardDnd({ day, planDay, contentOrder }: UseDayBoardDndProps) {
  const [activeDragItem, setActiveDragItem] = useState<PlanContentOrderItem | null>(null);
  const [activeDragSize, setActiveDragSize] = useState<DragPreviewSize | null>(null);

  const moveContent = usePlanStore((state) => state.moveContent);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetDragState = () => {
    setActiveDragItem(null);
    setActiveDragSize(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (!planDay) return;

    const item = contentOrder.find(
      (current) => `${current.type}:${current.id}` === String(active.id),
    );

    if (!item) return;

    setActiveDragItem(item);

    const rect = active.rect.current.initial;

    if (rect) {
      setActiveDragSize({
        width: rect.width,
        height: rect.height,
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !planDay) {
      resetDragState();
      return;
    }

    const activeItem = contentOrder.find((item) => `${item.type}:${item.id}` === String(active.id));

    const overItem = contentOrder.find((item) => `${item.type}:${item.id}` === String(over.id));

    if (activeItem && overItem) {
      moveContent(day, activeItem, overItem);
    }

    resetDragState();
  };

  return {
    activeDragItem,
    activeDragSize,
    sensors,
    handleDragStart,
    handleDragEnd,
    resetDragState,
  };
}
