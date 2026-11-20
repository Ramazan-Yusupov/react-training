import { SLOT_LABELS, useUserWorkoutPlanStore, groupTasksBySlot } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { Card, ErrorUI, Typography } from '@/shared/ui';
import { DayHeader } from './DayHeader';
import { DayProgress } from './DayProgress';
import { TaskItem } from './TaskItem';

interface DayBoardProps {
  day: number;
}

/** Главная карточка дня: заголовок, прогресс и задачи по карточкам. */
export function DayBoard({ day }: DayBoardProps) {
  const startDate = useProgressStore((state) => state.startDate);
  const workStartHour = useSettingsStore((state) => state.workStartHour);

  const templateDay = useUserWorkoutPlanStore((state) =>
    state.template.days.find((item) => item.day === day),
  );

  const dayOverride = useUserWorkoutPlanStore((state) => state.dayOverrides[String(day)]);

  const workoutDay = dayOverride ?? templateDay;

  if (!workoutDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  const customGroups = workoutDay.groups ?? [];

  // Системные задачи без пользовательской карточки остаются
  // сгруппированными по прежним временным слотам.
  const slotGroups = groupTasksBySlot(workoutDay.tasks.filter((task) => !task.groupId));

  return (
    <Card>
      <DayHeader day={workoutDay} startDate={startDate} />
      <DayProgress day={workoutDay} />

      {/* Пользовательские карточки */}
      {customGroups.map((group) => {
        const tasks = workoutDay.tasks.filter((task) => task.groupId === group.id);

        return (
          <section
            key={group.id}
            className="flex flex-col gap-3 rounded-2xl border-2 border-slate-800 p-3"
          >
            <Typography as="h6" align="start" tone="accent" text={group.title} />

            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} day={day} workStartHour={workStartHour} />
            ))}
          </section>
        );
      })}

      {/* Существующие системные задачи */}
      {slotGroups.map((group) => (
        <section
          key={group.slot}
          className="flex flex-col gap-3 rounded-2xl border-2 border-slate-800 p-3"
        >
          <Typography as="h6" align="start" tone="accent" text={SLOT_LABELS[group.slot]} />

          {group.tasks.map((task) => (
            <TaskItem key={task.id} task={task} day={day} workStartHour={workStartHour} />
          ))}
        </section>
      ))}
    </Card>
  );
}
