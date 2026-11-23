import { createPortal } from 'react-dom';

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { EditScope, PlanDay, PlanWidgetType } from '@/entities/plan';

import { Card } from '@/shared/ui';

import { AddContentMenu } from './AddContentMenu';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { DragPreview } from './DragPreview';
import { DragPreviewContent } from './DragPreviewContent';
import { GroupContentItem } from './GroupContentItem';
import { PlanWidgetItem } from './PlanWidgetItem';
import { SortableContentItem, getContentSortableId } from './SortableContentItem';
import { StandaloneTaskItem } from './StandaloneTaskItem';

import { getDayContentOrder } from '../model/getDayContentOrder';
import { getGroupTasks } from '../model/getGroupTasks';
import { useDayBoardDnd } from '../model/useDayBoardDnd';

interface DayBoardViewProps {
  day: number;
  planDay: PlanDay;
  startDate: string;
  totalDays: number;
  onDayChange: (day: number) => void;
  onAddWidget: (type: PlanWidgetType, scope: EditScope) => string | null;
}

export function DayBoardView({
  day,
  planDay,
  startDate,
  totalDays,
  onDayChange,
  onAddWidget,
}: DayBoardViewProps) {
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

  return (
    <Card
      classNameMain="h-auto min-h-0 xl:h-full"
      className="h-auto min-h-0 overflow-visible xl:h-full xl:overflow-hidden"
      classNameChild="min-h-0 flex-none overflow-visible xl:flex-1 xl:overflow-hidden"
    >
      <DayHeader day={planDay} startDate={startDate} totalDays={totalDays} onChange={onDayChange} />

      <DayProgress day={planDay} />

      <AddContentMenu day={day} planDay={planDay} onAddWidget={onAddWidget} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDragState}
      >
        <div className="min-h-0 flex-none overflow-visible space-y-4 pr-1 scrollbar-none xl:flex-1 xl:overflow-y-auto xl:overscroll-contain">
          <SortableContext
            items={contentOrder.map(getContentSortableId)}
            strategy={verticalListSortingStrategy}
          >
            {contentOrder.map((item) => {
              if (item.type === 'group') {
                const group = planDay.groups.find((current) => current.id === item.id);

                if (!group) return null;

                const tasks = getGroupTasks(planDay.tasks, group.id);

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
