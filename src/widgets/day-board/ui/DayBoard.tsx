import { SLOT_LABELS, getWorkoutDay, groupTasksBySlot } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { Card, ErrorUI, Typography } from '@/shared/ui';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { TaskItem } from './TaskItem';

interface DayBoardProps {
  day: number;
}

/** Главная карточка дня: заголовок, прогресс и задачи по времени суток. */
export function DayBoard({ day }: DayBoardProps) {
  const startDate = useProgressStore((state) => state.startDate);
  const workStartHour = useSettingsStore((state) => state.workStartHour);
  const workoutDay = getWorkoutDay(day);

  if (!workoutDay) return <ErrorUI isError text={`Для дня ${day} нет данных`} />;

  return (
    <Card>
      <DayHeader day={workoutDay} startDate={startDate} />
      <DayProgress day={workoutDay} />
      {groupTasksBySlot(workoutDay.tasks).map((group) => (
        <section key={group.slot} className="flex flex-col gap-3">
          <Typography as="h6" align="start" tone="accent" text={SLOT_LABELS[group.slot]} />
          {group.tasks.map((task) => (
            <TaskItem key={task.id} task={task} day={day} workStartHour={workStartHour} />
          ))}
        </section>
      ))}
    </Card>
  );
}
