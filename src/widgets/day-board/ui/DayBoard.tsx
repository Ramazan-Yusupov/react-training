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
}

export function DayBoard({ day }: DayBoardProps) {
  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  if (!planDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  return (
    <Card>
      <DayHeader day={planDay} startDate={startDate} totalDays={template.days.length} />

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
      </div>
    </Card>
  );
}
