import { ExerciseDetails, getPostureDay, getTaskTime } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { CorsetLog } from '@/features/log-corset';
import { ToggleTask } from '@/features/toggle-task';
import { formatDayMonth, getIsoWeekday, weekdayShort } from '@/shared/lib';
import { Badge, Card, Progress, Typography } from '@/shared/ui';

interface PostureDayDetailsProps {
  day: number;
  date: string;
}

export function PostureDayDetails({ day, date }: PostureDayDetailsProps) {
  const postureDay = getPostureDay(day);
  const completed = useProgressStore((state) => state.completed);
  const actualMinutes = useProgressStore((state) => state.corsetMinutes[day] ?? 0);
  const workStartHour = useSettingsStore((state) => state.workStartHour);
  const showOptional = useSettingsStore((state) => state.showOptionalPosture);

  if (!postureDay) return null;

  const tasks = postureDay.tasks.filter((task) => showOptional || task.enabledByDefault !== false);
  const requiredTasks = tasks.filter((task) => task.required);
  const doneRequired = requiredTasks.filter((task) => Boolean(completed[task.id])).length;
  const dayXp = postureDay.tasks.reduce(
    (sum, task) => sum + (completed[task.id] ? task.xp : 0),
    0,
  );

  return (
    <Card
      title={`День ${day} · ${weekdayShort(getIsoWeekday(date))} · ${formatDayMonth(date)}`}
      headerRight={
        postureDay.corsetOff ? (
          <Badge color="yellow" text="Восстановление" />
        ) : (
          <Badge color="blue" text={`Неделя ${postureDay.week}`} />
        )
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography align="start" tone="muted">Обязательные задачи</Typography>
        <Typography as="span" tone="muted">{doneRequired} из {requiredTasks.length}</Typography>
      </div>
      <Progress value={doneRequired} max={Math.max(requiredTasks.length, 1)} color="green" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge text={`За день: ${dayXp} XP`} />
        <Typography as="span" tone="muted">План: {postureDay.totalMinutesMorningOnly} мин утром</Typography>
      </div>
      {postureDay.corsetOff && (
        <Typography align="start" tone="success">
          Сегодня день восстановления от корсета. В плане предусмотрена лёгкая активность.
        </Typography>
      )}
      {tasks.length === 0 ? (
        <Typography align="start" tone="muted">На этот день нет включённых задач.</Typography>
      ) : tasks.map((task) => (
        <div key={task.id} className="flex flex-col gap-2 border-b border-white/10 pb-4 last:border-0 last:pb-0">
          <ToggleTask task={task} time={getTaskTime(task, workStartHour)} />
          <ExerciseDetails exerciseRef={task.exerciseRef} />
          {task.note && <Typography align="start" tone="muted" className="text-xs">{task.note}</Typography>}
        </div>
      ))}
      {!postureDay.corsetOff && (
        <>
          <CorsetLog postureDay={day} plannedMinutes={postureDay.totalMinutesMorningOnly} />
          <div className="rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <Typography align="start" tone="muted">Фактическое время корсета</Typography>
              <Typography as="h4" tone="accent">{actualMinutes} мин</Typography>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (actualMinutes / Math.max(postureDay.totalMinutesMorningOnly, 1)) * 100)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
