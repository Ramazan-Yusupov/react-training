import { createPortal } from 'react-dom';

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { usePlanStore } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { Card, ErrorUI } from '@/shared/ui';

import { AddContentMenu } from './AddContentMenu';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { DragPreview } from './DragPreview';
import { DragPreviewContent } from './DragPreviewContent';
import { GroupContentItem } from './GroupContentItem';
import { getContentSortableId, SortableContentItem } from './SortableContentItem';
import { PlanWidgetItem } from './PlanWidgetItem';
import { StandaloneTaskItem } from './StandaloneTaskItem';

import { getDayContentOrder } from '../model/getDayContentOrder';
import { useDayBoardDnd } from '../model/useDayBoardDnd';

interface DayBoardProps {
  day: number;
  onDayChange: (day: number) => void;
}

export function DayBoard({ day, onDayChange }: DayBoardProps) {
  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);

  const addWidget = usePlanStore((state) => state.addWidget);

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  const contentOrder = getDayContentOrder(planDay);

  const {
    activeDragItem,
    activeDragSize,
    sensors,
    handleDragStart,
    handleDragEnd,
    resetDragState,
  } = useDayBoardDnd({
    day,
    planDay,
    contentOrder,
  });

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
