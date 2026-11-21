import { useState } from 'react';
import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem, PlanWidget, PlanWidgetType } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';
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

  const updateWidget = usePlanStore((state) => state.updateWidget);
  const deleteWidget = usePlanStore((state) => state.deleteWidget);

  const title =
    widget.type === 'micro-breaks'
      ? 'Микро-паузы'
      : widget.type === 'xp-by-days'
        ? 'XP по дням'
        : 'Аккордеон';

  const handleEnabledChange = (scope: 'day' | 'all', enabled: boolean) => {
    updateWidget(day, widget.id, { enabled }, scope);
    setIsEditorOpen(false);
  };

  const handleDelete = (scope: 'day' | 'all') => {
    deleteWidget(day, widget.id, scope);
    setIsEditorOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Typography as="h6" align="start" tone="accent" text={title} />

        <Button size="sm" variant="ghost" onClick={() => setIsEditorOpen(true)}>
          Настроить
        </Button>
      </div>

      {widget.enabled ? (
        <>
          {widget.type === 'micro-breaks' && <MicroBreaks day={day} />}

          {widget.type === 'xp-by-days' && <XpWeekChart day={day} />}

          {widget.type === 'accordion' && (
            <Card>
              <Typography tone="muted" align="start">
                Редактор аккордеона появится на следующем этапе.
              </Typography>
            </Card>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 p-4">
          <Typography tone="muted" align="start">
            Виджет отключён
          </Typography>
        </div>
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

          <Button
            fullWidth
            variant="outline"
            onClick={() => handleEnabledChange('day', !widget.enabled)}
          >
            {widget.enabled ? 'Отключить на этот день' : 'Включить на этот день'}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={() => handleEnabledChange('all', !widget.enabled)}
          >
            {widget.enabled ? 'Отключить во всех днях' : 'Включить во всех днях'}
          </Button>

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

  // Для старых данных без contentOrder используем порядок:
  // сначала карточки, затем самостоятельные задачи и виджеты.
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

          return <PlanWidgetItem key={`widget-${widget.id}`} day={day} widget={widget} />;
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

      {/* Общее меню добавления */}
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

      {/* Выбор типа виджета */}
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

          <Button fullWidth variant="outline" disabled>
            Аккордеон — скоро
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsWidgetTypeOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      {/* Выбор области отображения виджета */}
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

      {/* Выбор места для новой задачи */}
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

      {/* Редакторы создания открываются из общего меню */}
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
