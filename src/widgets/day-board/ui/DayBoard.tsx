import { useEffect, useState, type ReactNode } from 'react';

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
import type { PlanContentOrderItem, PlanWidget, PlanWidgetType } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { MicroBreaksEditor } from '@/features/manage-micro-breaks';

import { Button, Card, ErrorUI, Modal, Select, Typography } from '@/shared/ui';

import { FaGripVertical, FaPlus } from 'react-icons/fa6';

import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { GroupEditor } from './GroupEditor';
import { TaskEditor } from './TaskEditor';
import { TaskItem } from './TaskItem';

interface DayBoardProps {
  day: number;
  onDayChange: (day: number) => void;
}

interface PlanWidgetItemProps {
  day: number;
  widget: PlanWidget;
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
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
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

function DragPreview({
  item,
  size,
  title,
  subtitle,
}: {
  item: PlanContentOrderItem;
  size: DragPreviewSize;
  title: string;
  subtitle?: string;
}) {
  const borderClass =
    item.type === 'group'
      ? 'border-slate-700'
      : item.type === 'task'
        ? 'border-dashed border-slate-700'
        : 'border-dotted border-amber-600';

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        maxWidth: '100%',
      }}
      className={`flex min-w-0 flex-col justify-center gap-2 overflow-hidden rounded-2xl border-2 bg-slate-950 p-3 pl-10 shadow-2xl shadow-black/50 ${borderClass}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <FaGripVertical className="shrink-0 text-blue-400" size={16} />

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-blue-400">{title}</div>

          {subtitle && <div className="truncate text-xs text-slate-400">{subtitle}</div>}
        </div>

        <span className="shrink-0 rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-400">
          Перемещение
        </span>
      </div>
    </div>
  );
}

function PlanWidgetItem({ day, widget }: PlanWidgetItemProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMicroBreakEditorOpen, setIsMicroBreakEditorOpen] = useState(false);
  const [isNotesEditorOpen, setIsNotesEditorOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(widget.notes);

  const deleteWidget = usePlanStore((state) => state.deleteWidget);
  const updateWidgetNotes = usePlanStore((state) => state.updateWidgetNotes);

  const title =
    widget.type === 'micro-breaks'
      ? 'Микро-паузы'
      : widget.type === 'xp-by-days'
        ? 'XP по дням'
        : 'Заметки дня';

  useEffect(() => {
    setNotesDraft(widget.notes);
  }, [day, widget.id, widget.notes]);

  useEffect(() => {
    if (widget.type !== 'day-notes' || notesDraft === widget.notes) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateWidgetNotes(day, widget.id, notesDraft);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [day, widget.id, widget.type, widget.notes, notesDraft, updateWidgetNotes]);

  const handleDelete = (scope: 'day' | 'all') => {
    deleteWidget(day, widget.id, scope);
    setIsEditorOpen(false);
  };

  const openMicroBreakEditor = () => {
    setIsEditorOpen(false);
    setIsMicroBreakEditorOpen(true);
  };

  const openSettings = () => setIsEditorOpen(true);

  const handleClearNotes = () => {
    setNotesDraft('');
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {widget.type === 'micro-breaks' && <MicroBreaks day={day} onSettingsClick={openSettings} />}

      {widget.type === 'xp-by-days' && <XpWeekChart day={day} onSettingsClick={openSettings} />}

      {widget.type === 'day-notes' && (
        <Card classNameMain="border-2 border-dotted border-amber-600 rounded-2xl p-4 pl-10">
          <div className="flex items-center justify-between gap-3">
            <Typography as="h6" align="start" tone="accent" text={title} />

            <Button size="sm" variant="ghost" onClick={() => setIsNotesEditorOpen(true)}>
              Редактировать
            </Button>
          </div>

          <div className="mt-3">
            {widget.notes.trim() ? (
              <p className="whitespace-pre-wrap wrap-break-words text-sm text-slate-300">
                {widget.notes}
              </p>
            ) : (
              <Typography align="start" tone="muted">
                Пока нет заметок. Нажми «Редактировать», чтобы добавить текст.
              </Typography>
            )}
          </div>
        </Card>
      )}

      <Modal
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={`Настройки: ${title}`}
      >
        <div className="flex flex-col gap-3">
          <Typography align="start" tone="muted">
            Управление виджетом
          </Typography>

          {widget.type === 'micro-breaks' && (
            <Button fullWidth variant="primary" onClick={openMicroBreakEditor}>
              Редактировать список микро-пауз
            </Button>
          )}

          <div className="my-1 border-t border-white/10" />

          <Button fullWidth variant="danger" onClick={() => handleDelete('day')}>
            Удалить из этого дня
          </Button>

          <Button fullWidth variant="outline" onClick={() => handleDelete('all')}>
            Удалить из всех дней
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsEditorOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isMicroBreakEditorOpen}
        onClose={() => setIsMicroBreakEditorOpen(false)}
        title="Редактор микро-пауз"
        size="lg"
      >
        <MicroBreaksEditor />
      </Modal>

      <Modal
        open={isNotesEditorOpen}
        onClose={() => setIsNotesEditorOpen(false)}
        title="Заметки дня"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">Текст заметки</span>

            <textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              placeholder="Запиши важные мысли, планы или итоги дня..."
              rows={8}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"
            />
          </label>

          <Typography align="start" tone="muted">
            Изменения сохраняются автоматически.
          </Typography>

          <div className="flex flex-col gap-2">
            <Button fullWidth variant="outline" onClick={handleClearNotes} disabled={!notesDraft}>
              Очистить заметки
            </Button>

            <Button fullWidth variant="primary" onClick={() => setIsNotesEditorOpen(false)}>
              Готово
            </Button>
          </div>
        </div>
      </Modal>
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

  const getDragTitle = () => {
    if (!activeDragItem) return '';

    if (activeDragItem.type === 'group') {
      return planDay.groups.find((item) => item.id === activeDragItem.id)?.title ?? '';
    }

    if (activeDragItem.type === 'task') {
      return planDay.tasks.find((item) => item.id === activeDragItem.id)?.title ?? '';
    }

    const widget = planDay.widgets.find((item) => item.id === activeDragItem.id);

    if (!widget) return '';

    return widget.type === 'micro-breaks'
      ? 'Микро-паузы'
      : widget.type === 'xp-by-days'
        ? 'XP по дням'
        : 'Заметки дня';
  };

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

  const getDragSubtitle = () => {
    if (!activeDragItem) return '';

    if (activeDragItem.type === 'group') {
      const tasks = planDay.tasks.filter((task) => task.groupId === activeDragItem.id);

      return `${tasks.length} задач`;
    }

    if (activeDragItem.type === 'task') {
      const task = planDay.tasks.find((item) => item.id === activeDragItem.id);

      return task ? `${task.durationMin} мин · +${task.xp} XP` : '';
    }

    return 'Виджет дня';
  };

  return (
    <Card>
      <DayHeader
        day={planDay}
        startDate={startDate}
        totalDays={template.days.length}
        onChange={onDayChange}
      />

      <DayProgress day={planDay} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDragState}
      >
        <div className="flex flex-col gap-3">
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

                        <GroupEditor day={day} group={group} />
                      </div>

                      {tasks.map((task) => (
                        <TaskItem key={task.id} task={task} day={day} />
                      ))}
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

          <Button
            size="md"
            variant="outline"
            icon={<FaPlus />}
            fullWidth
            onClick={() => setIsAddMenuOpen(true)}
          >
            Добавить карточку, виджет, задачу
          </Button>
        </div>

        <DragOverlay adjustScale={false}>
          {activeDragItem && activeDragSize ? (
            <DragPreview
              item={activeDragItem}
              size={activeDragSize}
              title={getDragTitle()}
              subtitle={getDragSubtitle()}
            />
          ) : null}
        </DragOverlay>
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
