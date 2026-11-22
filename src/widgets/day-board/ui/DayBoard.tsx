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

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { Card, ErrorUI, Typography } from '@/shared/ui';

import { AddContentMenu } from './AddContentMenu';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { DragPreview, type DragPreviewSize } from './DragPreview';
import { GroupContentItem } from './GroupContentItem';
import { getContentSortableId, SortableContentItem } from './SortableContentItem';
import { PlanWidgetItem } from './PlanWidgetItem';
import { StandaloneTaskItem } from './StandaloneTaskItem';
import { TaskItem } from './TaskItem';

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

  const getDragPreviewContent = () => {
    if (!activeDragItem) return null;

    if (activeDragItem.type === 'group') {
      const group = planDay?.groups.find((item) => item.id === activeDragItem.id);

      if (!group || !planDay) return null;

      const tasks = planDay.tasks.filter((task) => task.groupId === group.id);

      return (
        <section className="flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-3 pl-10">
          <Typography as="h6" align="start" tone="accent" text={group.title} />

          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} day={day} />
          ))}
        </section>
      );
    }

    if (activeDragItem.type === 'task') {
      const task = planDay?.tasks.find((item) => item.id === activeDragItem.id);

      if (!task) return null;

      return (
        <div className="h-full min-w-0 rounded-2xl bg-slate-950">
          <StandaloneTaskItem task={task} day={day} />
        </div>
      );
    }

    const widget = planDay?.widgets.find((item) => item.id === activeDragItem.id);

    if (!widget) return null;

    if (widget.type === 'micro-breaks') {
      return <MicroBreaks day={day} onSettingsClick={() => {}} />;
    }

    if (widget.type === 'xp-by-days') {
      return <XpWeekChart day={day} onSettingsClick={() => {}} />;
    }

    return (
      <Card classNameMain="border-2 border-dotted border-amber-600 rounded-2xl p-4 pl-10">
        <Typography as="h6" align="start" tone="accent" text="Заметки дня" />

        <div className="mt-3">
          {widget.notes.trim() ? (
            <p className="whitespace-pre-wrap wrap-break-words text-sm text-slate-300">
              {widget.notes}
            </p>
          ) : (
            <Typography align="start" tone="muted">
              Пока нет заметок.
            </Typography>
          )}
        </div>
      </Card>
    );
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
              <DragPreview size={activeDragSize}>{getDragPreviewContent()}</DragPreview>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </Card>
  );
}
