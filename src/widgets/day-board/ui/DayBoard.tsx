import { createPortal } from 'react-dom';
import { useState } from 'react';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { Card, ErrorUI } from '@/shared/ui';

import { AddContentMenu } from './AddContentMenu';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { DragPreview, type DragPreviewSize } from './DragPreview';
import { DragPreviewContent } from './DragPreviewContent';
import { GroupContentItem } from './GroupContentItem';
import { getContentSortableId, SortableContentItem } from './SortableContentItem';
import { PlanWidgetItem } from './PlanWidgetItem';
import { StandaloneTaskItem } from './StandaloneTaskItem';

interface DayBoardProps {
  day: number;
  onDayChange: (day: number) => void;
}

export function DayBoard({ day, onDayChange }: DayBoardProps) {
  const [activeDragItem, setActiveDragItem] = useState<PlanContentOrderItem | null>(null);
  const [activeDragSize, setActiveDragSize] = useState<DragPreviewSize | null>(null);

  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);

  const addWidget = usePlanStore((state) => state.addWidget);
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

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  const contentOrder: PlanContentOrderItem[] = planDay
    ? (planDay.contentOrder ?? [
        ...planDay.groups.map((group) => ({
          type: 'group' as const,
          id: group.id,
        })),
        ...planDay.tasks
          .filter((task) => task.groupId === null)
          .map((task) => ({
            type: 'task' as const,
            id: task.id,
          })),
        ...planDay.widgets.map((widget) => ({
          type: 'widget' as const,
          id: widget.id,
        })),
      ])
    : [];

  const resetDragState = () => {
    setActiveDragItem(null);
    setActiveDragSize(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (!planDay) return;

    const item = contentOrder.find(
      (current) => getContentSortableId(current) === String(active.id),
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

    const activeItem = contentOrder.find(
      (item) => getContentSortableId(item) === String(active.id),
    );

    const overItem = contentOrder.find((item) => getContentSortableId(item) === String(over.id));

    if (activeItem && overItem) {
      moveContent(day, activeItem, overItem);
    }

    resetDragState();
  };

  if (!planDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  return (
    <Card
      classNameMain="h-full min-h-0"
      className="h-full min-h-0 overflow-hidden"
      classNameChild="min-h-0 flex-1 overflow-hidden"
    >
      <DayHeader
        day={planDay}
        startDate={startDate}
        totalDays={template.days.length}
        onChange={onDayChange}
      />

      <DayProgress day={planDay} />

      <AddContentMenu
        day={day}
        planDay={planDay}
        onAddWidget={(type, scope) => addWidget(day, type, scope)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDragState}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 scrollbar-none space-y-4">
          <SortableContext
            items={contentOrder.map(getContentSortableId)}
            strategy={verticalListSortingStrategy}
          >
            {contentOrder.map((item) => {
              if (item.type === 'group') {
                const group = planDay.groups.find((current) => current.id === item.id);

                if (!group) return null;

                const tasks = planDay.tasks.filter((task) => task.groupId === group.id);

                return (
                  <SortableContentItem key={`group-${group.id}`} item={item}>
                    <GroupContentItem day={day} group={group} tasks={tasks} />
                  </SortableContentItem>
                );
              }

              if (item.type === 'task') {
                const task = planDay.tasks.find(
                  (current) => current.id === item.id && current.groupId === null,
                );

                if (!task) return null;

                return (
                  <SortableContentItem key={`task-${task.id}`} item={item}>
                    <StandaloneTaskItem task={task} day={day} />
                  </SortableContentItem>
                );
              }

              const widget = planDay.widgets.find((current) => current.id === item.id);

              if (!widget) return null;

              return (
                <SortableContentItem key={`widget-${widget.id}`} item={item}>
                  <PlanWidgetItem day={day} widget={widget} />
                </SortableContentItem>
              );
            })}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay adjustScale={false} dropAnimation={null}>
            {activeDragItem && activeDragSize ? (
              <DragPreview size={activeDragSize}>
                <DragPreviewContent item={activeDragItem} day={day} planDay={planDay} />
              </DragPreview>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </Card>
  );
}
