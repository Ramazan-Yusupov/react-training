import { usePlanStore } from '@/entities/plan';
import type { PlanContentOrderItem } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Card, ErrorUI, Typography } from '@/shared/ui';

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

                <TaskEditor day={day} groupId={group.id} />
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

        {/* Временные кнопки добавления. Позже заменим единым меню. */}
        <GroupEditor day={day} />
        <TaskEditor day={day} />
      </div>
    </Card>
  );
}
