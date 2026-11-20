import { ExerciseDetails, getPostureDay, getTaskTime, posturePlan } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { CorsetLog } from '@/features/log-corset';
import { ToggleTask } from '@/features/toggle-task';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { addDays, diffDays, formatDayMonth, todayISO } from '@/shared/lib';
import { Accordion, Badge, Button, Card, Typography, toast } from '@/shared/ui';

interface PostureTodayProps {
  /** Номер выбранного дня тренировочного плана */
  day: number;
}

/** Блок осанки для выбранной даты: корсет, журнал минут, красные флаги. */
export function PostureToday({ day }: PostureTodayProps) {
  const startDate = useProgressStore((state) => state.startDate);
  const postureStartDate = useProgressStore((state) => state.postureStartDate);
  const startPostureToday = useProgressStore((state) => state.startPostureToday);
  const workStartHour = useSettingsStore((state) => state.workStartHour);
  const showOptional = useSettingsStore((state) => state.showOptionalPosture);

  if (!postureStartDate) {
    return (
      <Card
        title="Осанка"
        footer={
          <Button
            variant="primary"
            title="Начать план осанки сегодня"
            onClick={() => {
              startPostureToday();
              toast.success('План осанки начат: сегодня день 1');
            }}
          />
        }
      >
        <Typography
          as="p"
          align="start"
          text="План осанки идёт отдельно от тренировок. Первые 7 дней утренний блок корсета по 60 минут, дальше по плану."
        />
      </Card>
    );
  }

  const date = addDays(startDate, day - 1);
  const postureDayNumber = diffDays(postureStartDate, date) + 1;
  const postureDay =
    postureDayNumber >= 1 && postureDayNumber <= PLAN_LENGTH_DAYS
      ? getPostureDay(postureDayNumber)
      : undefined;

  if (!postureDay) {
    return (
      <Card title="Осанка">
        <Typography
          as="p"
          align="start"
          tone="muted"
          text={`На ${formatDayMonth(date)} в плане осанки нет дня (план начат ${formatDayMonth(postureStartDate)}).`}
        />
      </Card>
    );
  }

  const tasks = postureDay.tasks.filter((task) => showOptional || task.enabledByDefault !== false);
  const isToday = date === todayISO();

  return (
    <Card
      title={`Осанка: день ${postureDay.day} из ${PLAN_LENGTH_DAYS}`}
      headerRight={
        postureDay.corsetOff ? <Badge color="green" text="Отдых от корсета" /> : undefined
      }
    >
      {isToday && <Typography as="span" align="start" tone="muted" text="Сегодня" />}
      {tasks.map((task) => (
        <div key={task.id} className="flex flex-col gap-2">
          <ToggleTask task={task} time={getTaskTime(task, workStartHour)} />
          <ExerciseDetails exerciseRef={task.exerciseRef} />
        </div>
      ))}
      {!postureDay.corsetOff && (
        <CorsetLog
          postureDay={postureDay.day}
          plannedMinutes={postureDay.totalMinutesMorningOnly}
        />
      )}
      <Accordion
        items={[
          {
            id: 'red-flags',
            title: 'Красные флаги: когда снять корсет',
            content: (
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {posturePlan.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </Card>
  );
}
