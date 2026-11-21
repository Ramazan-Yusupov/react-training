import { useState } from 'react';
import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
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

export function DayBoard({ day, onDayChange }: DayBoardProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isTaskTargetOpen, setIsTaskTargetOpen] = useState(false);
  const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [taskGroupId, setTaskGroupId] = useState<string | undefined>(undefined);

  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  if (!planDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  // Для старых данных без contentOrder используем порядок:
  // сначала карточки, затем самостоятельные задачи.
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

          // Виджеты подключим после создания их модели.
          return null;
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

          <Button fullWidth variant="outline" disabled>
            Виджет — скоро
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsAddMenuOpen(false)}>
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
