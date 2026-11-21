import { useEffect, useState } from 'react';

import { usePlanStore } from '@/entities/plan';

import type { PlanContentOrderItem, PlanWidget, PlanWidgetType } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { MicroBreaksEditor } from '@/features/manage-micro-breaks';

import { Button, Card, ErrorUI, Modal, Select, Typography } from '@/shared/ui';

import { FaPlus } from 'react-icons/fa6';

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

  // Синхронизируем черновик с данными виджета.
  useEffect(() => {
    setNotesDraft(widget.notes);
  }, [day, widget.id, widget.notes]);

  // Автосохранение заметок после небольшой паузы во вводе.
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
    <div className="flex flex-col gap-2">
      {widget.type === 'micro-breaks' && <MicroBreaks day={day} onSettingsClick={openSettings} />}

      {widget.type === 'xp-by-days' && <XpWeekChart day={day} onSettingsClick={openSettings} />}

      {widget.type === 'day-notes' && (
        <Card classNameMain="border-2 border-dotted border-amber-600 p-4 rounded-2xl ">
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

  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);
  const addWidget = usePlanStore((state) => state.addWidget);

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  if (!planDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  const contentOrder: PlanContentOrderItem[] = planDay.contentOrder ?? [
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
  ];

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
    <Card>
      <DayHeader
        day={planDay}
        startDate={startDate}
        totalDays={template.days.length}
        onChange={onDayChange}
      />

      <DayProgress day={planDay} />

      <div className="flex flex-col gap-3">
        {contentOrder.map((item) => {
          if (item.type === 'group') {
            const group = planDay.groups.find((current) => current.id === item.id);

            if (!group) return null;

            const tasks = planDay.tasks.filter((task) => task.groupId === group.id);

            return (
              <section
                key={`group-${group.id}`}
                className="flex flex-col gap-3 rounded-2xl border-2 border-slate-800 p-3"
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <Typography as="h6" align="start" tone="accent" text={group.title} />

                  <GroupEditor day={day} group={group} />
                </div>

                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} day={day} />
                ))}
              </section>
            );
          }

          if (item.type === 'task') {
            const task = planDay.tasks.find(
              (current) => current.id === item.id && current.groupId === null,
            );

            if (!task) return null;

            return <TaskItem key={`task-${task.id}`} task={task} day={day} />;
          }

          const widget = planDay.widgets.find((current) => current.id === item.id);

          if (!widget) return null;

          return <PlanWidgetItem key={`${day}-${widget.id}`} day={day} widget={widget} />;
        })}

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
