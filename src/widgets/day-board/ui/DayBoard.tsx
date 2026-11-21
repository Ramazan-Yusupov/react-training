import { usePlanStore } from '@/entities/plan';
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

  const standaloneTasks = planDay.tasks.filter((task) => task.groupId === null);

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
        {planDay.groups.map((group) => {
          const tasks = planDay.tasks.filter((task) => task.groupId === group.id);

          return (
            <section
              key={group.id}
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
        })}

        <GroupEditor day={day} />

        <section className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-slate-700 p-3">
          <Typography as="h6" align="start" tone="accent" text="Задачи без карточки" />

          {standaloneTasks.length > 0 ? (
            standaloneTasks.map((task) => <TaskItem key={task.id} task={task} day={day} />)
          ) : (
            <p className="text-sm text-gray-400">
              Здесь можно хранить отдельные задачи, не привязанные к карточкам.
            </p>
          )}

          <TaskEditor day={day} />
        </section>
      </div>
    </Card>
  );
}
