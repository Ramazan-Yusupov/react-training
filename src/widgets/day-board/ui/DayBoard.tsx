import { createPortal } from 'react-dom';
import { useState, type ReactNode } from 'react';

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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem, PlanWidgetType } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { Button, Card, ErrorUI, Modal, Select, Typography } from '@/shared/ui';

import { FaGripVertical, FaPlus } from 'react-icons/fa6';

import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { GroupEditor } from './GroupEditor';
import { PlanWidgetItem } from './PlanWidgetItem';
import { TaskEditor } from './TaskEditor';
import { TaskItem } from './TaskItem';

interface DayBoardProps {
  day: number;
  onDayChange: (day: number) => void;
}

interface SortableContentItemProps {
  item: PlanContentOrderItem;
  children: ReactNode;
}

interface DragPreviewSize {
  width: number;
  height: number;
}

function getContentSortableId(item: PlanContentOrderItem) {
  return `${item.type}:${item.id}`;
}

function SortableContentItem({ item, children }: SortableContentItemProps) {
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

function DragPreview({ size, children }: { size: DragPreviewSize; children: ReactNode }) {
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        boxSizing: 'border-box',
      }}
      className="pointer-events-none overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-black/60 ring-2 ring-blue-500/70"
    >
      {children}
    </div>
  );
}

export function DayBoard({ day, onDayChange }: DayBoardProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isTaskTargetOpen, setIsTaskTargetOpen] = useState(false);
  const [isWidgetTypeOpen, setIsWidgetTypeOpen] = useState(false);
  const [isWidgetScopeOpen, setIsWidgetScopeOpen] = useState(false);
  const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedWidgetType, setSelectedWidgetType] = useState<PlanWidgetType | null>(null);
  const [taskGroupId, setTaskGroupId] = useState<string | undefined>(undefined);

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
          <TaskItem task={task} day={day} />
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

  const openTaskTarget = () => {
    setSelectedGroupId(planDay.groups[0]?.id ?? '');
    setIsAddMenuOpen(false);
    setIsTaskTargetOpen(true);
  };

  const openStandaloneTask = () => {
    setTaskGroupId(undefined);
    setIsTaskTargetOpen(false);
    setIsTaskEditorOpen(true);
  };

  const openGroupTask = () => {
    if (!selectedGroupId) return;

    setTaskGroupId(selectedGroupId);
    setIsTaskTargetOpen(false);
    setIsTaskEditorOpen(true);
  };

  const openWidgetType = () => {
    setIsAddMenuOpen(false);
    setIsWidgetTypeOpen(true);
  };

  const selectWidgetType = (type: PlanWidgetType) => {
    setSelectedWidgetType(type);
    setIsWidgetTypeOpen(false);
    setIsWidgetScopeOpen(true);
  };

  const handleAddWidget = (scope: 'day' | 'all') => {
    if (!selectedWidgetType) return;

    addWidget(day, selectedWidgetType, scope);

    setSelectedWidgetType(null);
    setIsWidgetScopeOpen(false);
  };

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

      <Button
        size="md"
        variant="outline"
        icon={<FaPlus />}
        fullWidth
        onClick={() => setIsAddMenuOpen(true)}
      >
        Добавить карточку, виджет, задачу
      </Button>

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
                    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-800 p-3 pl-10">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <Typography as="h6" align="start" tone="accent" text={group.title} />

                        <div className="flex shrink-0 items-center gap-1">
                          <GroupEditor day={day} group={group} />
                        </div>
                      </div>

                      {tasks.map((task) => (
                        <TaskItem key={task.id} task={task} day={day} />
                      ))}

                      <TaskEditor day={day} groupId={group.id} />
                    </section>
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
                    <TaskItem task={task} day={day} />
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

      <Modal open={isAddMenuOpen} onClose={() => setIsAddMenuOpen(false)} title="Что добавить?">
        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              setIsAddMenuOpen(false);
              setIsGroupEditorOpen(true);
            }}
          >
            Карточку
          </Button>

          <Button fullWidth variant="outline" onClick={openTaskTarget}>
            Задачу
          </Button>

          <Button fullWidth variant="outline" onClick={openWidgetType}>
            Виджет
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsAddMenuOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isWidgetTypeOpen}
        onClose={() => setIsWidgetTypeOpen(false)}
        title="Выбери виджет"
      >
        <div className="flex flex-col gap-2">
          <Button fullWidth variant="outline" onClick={() => selectWidgetType('micro-breaks')}>
            Микро-паузы
          </Button>

          <Button fullWidth variant="outline" onClick={() => selectWidgetType('xp-by-days')}>
            XP по дням
          </Button>

          <Button fullWidth variant="outline" onClick={() => selectWidgetType('day-notes')}>
            Заметки дня
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsWidgetTypeOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isWidgetScopeOpen}
        onClose={() => {
          setIsWidgetScopeOpen(false);
          setSelectedWidgetType(null);
        }}
        title="Где отображать виджет?"
      >
        <div className="flex flex-col gap-2">
          <Button fullWidth variant="primary" onClick={() => handleAddWidget('day')}>
            Только день {day}
          </Button>

          <Button fullWidth variant="outline" onClick={() => handleAddWidget('all')}>
            Во всех днях
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              setIsWidgetScopeOpen(false);
              setSelectedWidgetType(null);
            }}
          >
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isTaskTargetOpen}
        onClose={() => setIsTaskTargetOpen(false)}
        title="Где создать задачу?"
      >
        <div className="flex flex-col gap-3">
          <Button fullWidth variant="outline" onClick={openStandaloneTask}>
            Самостоятельная задача
          </Button>

          <div className="flex flex-col gap-2">
            <Select
              label="Выбери карточку"
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              options={planDay.groups.map((group) => ({
                value: group.id,
                label: group.title,
              }))}
              placeholder="Выбрать карточку"
            />

            <Button
              fullWidth
              variant="primary"
              disabled={!selectedGroupId || planDay.groups.length === 0}
              onClick={openGroupTask}
            >
              Добавить в карточку
            </Button>
          </div>

          {planDay.groups.length === 0 && (
            <p className="text-sm text-gray-400">
              Сначала создай карточку, если хочешь добавить задачу внутрь неё.
            </p>
          )}

          <Button variant="ghost" fullWidth onClick={() => setIsTaskTargetOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <GroupEditor
        day={day}
        open={isGroupEditorOpen}
        onOpenChange={setIsGroupEditorOpen}
        hideTrigger
      />

      <TaskEditor
        day={day}
        groupId={taskGroupId}
        open={isTaskEditorOpen}
        onOpenChange={setIsTaskEditorOpen}
        hideTrigger
      />
    </Card>
  );
}
