import { gamification, posturePlan, workoutPlan, xpConfig } from '@/entities/plan';
import {
  dayXp,
  getCurrentDay,
  getLevelState,
  getStreak,
  isDayComplete,
  requiredProgress,
  totalXp,
  useProgressStore,
} from '@/entities/progress';
import { DaySwitcher, useSelectedDay } from '@/features/select-day';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { addDays, formatDayMonth, getIsoWeekday, todayISO, WEEKDAYS_SHORT } from '@/shared/lib';
import {
  Badge,
  BarChart,
  Calendar,
  Card,
  Progress,
  Typography,
  type CalendarCell,
} from '@/shared/ui';
import { useMemo } from 'react';

const MEASUREMENT_LABELS: Record<string, { label: string; unit: string }> = {
  pushups_max: { label: 'Отжимания', unit: 'раз' },
  pullups_max: { label: 'Подтягивания', unit: 'раз' },
  hang_sec: { label: 'Вис на турнике', unit: 'сек' },
  weight_kg: { label: 'Вес', unit: 'кг' },
  waist_cm: { label: 'Талия', unit: 'см' },
};

export function ProgressPage() {
  const { day, setDay, currentDay } = useSelectedDay();

  const startDate = useProgressStore((state) => state.startDate);
  const postureStartDate = useProgressStore((state) => state.postureStartDate);
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);
  const corsetMinutes = useProgressStore((state) => state.corsetMinutes);
  const measurements = useProgressStore((state) => state.measurements);

  const snapshot = useMemo(() => ({ completed, microBreaks }), [completed, microBreaks]);

  // Общая статистика XP и уровня.
  const workoutXp = totalXp(workoutPlan.days, snapshot, xpConfig);
  const postureXp = totalXp(posturePlan.days, snapshot, xpConfig, false);
  const total = workoutXp + postureXp;

  const level = getLevelState(total, gamification.levels);
  const streak = getStreak(workoutPlan.days, snapshot, currentDay);

  // Выполненные задачи и дни тренировочного плана.
  const allWorkoutTasks = workoutPlan.days.flatMap((item) => item.tasks);
  const allPostureTasks = posturePlan.days.flatMap((item) => item.tasks);
  const allTasks = [...allWorkoutTasks, ...allPostureTasks];

  const completedTasks = allTasks.filter((task) => completed[task.id]).length;

  const completedWorkoutDays = workoutPlan.days.filter((item) =>
    isDayComplete(item, snapshot),
  ).length;

  const workoutProgress = (completedWorkoutDays / PLAN_LENGTH_DAYS) * 100;

  // Данные выбранного дня.
  const selectedWorkoutDay = workoutPlan.days.find((item) => item.day === day);
  const selectedPostureDay = posturePlan.days.find((item) => item.day === day);

  const selectedProgress = selectedWorkoutDay
    ? requiredProgress(selectedWorkoutDay, snapshot)
    : { done: 0, total: 0 };

  const selectedXp = selectedWorkoutDay ? dayXp(selectedWorkoutDay, snapshot, xpConfig) : 0;

  const selectedDate = formatDayMonth(addDays(startDate, day - 1));

  // Календарь выполнения тренировочного плана.
  const calendarCells = useMemo<CalendarCell[]>(() => {
    return workoutPlan.days.map((item) => {
      const progress = requiredProgress(item, snapshot);

      let status: CalendarCell['status'] = item.kind === 'rest' ? 'rest' : 'future';

      if (isDayComplete(item, snapshot)) {
        status = 'done';
      } else if (progress.done > 0) {
        status = 'partial';
      } else if (
        !getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS).isBeforeStart &&
        item.day < currentDay
      ) {
        status = 'missed';
      }

      return {
        value: item.day,
        status,
        hint: `День ${item.day}: ${item.label}`,
      };
    });
  }, [snapshot, startDate, currentDay]);

  // XP за выбранный день и шесть предыдущих.
  const weeklyXp = useMemo(() => {
    const from = Math.max(1, day - 6);

    return Array.from({ length: day - from + 1 }, (_, index) => {
      const dayNumber = from + index;

      const workoutDay = workoutPlan.days.find((item) => item.day === dayNumber);
      const postureDay = posturePlan.days.find((item) => item.day === dayNumber);

      const workoutValue = workoutDay ? dayXp(workoutDay, snapshot, xpConfig) : 0;

      const postureValue = postureDay ? dayXp(postureDay, snapshot, xpConfig, false) : 0;

      return {
        label: `д${dayNumber}`,
        value: workoutValue + postureValue,
      };
    });
  }, [day, snapshot]);

  // Статистика плана осанки.
  const completedPostureDays = posturePlan.days.filter((item) =>
    isDayComplete(item, snapshot),
  ).length;

  const actualCorsetMinutes = Object.values(corsetMinutes).reduce(
    (sum, minutes) => sum + minutes,
    0,
  );

  const plannedCorsetMinutes = posturePlan.days.reduce(
    (sum, item) => sum + (item.totalMinutesMorningOnly ?? 0),
    0,
  );

  // Последние сохранённые замеры.
  const latestMeasurement = useMemo(() => {
    const measurementTasks = workoutPlan.days.flatMap((item) =>
      item.tasks.filter((task) => task.type === 'measure').map((task) => task.id),
    );

    return measurementTasks
      .filter((taskId) => measurements[taskId] && completed[taskId])
      .map((taskId) => ({
        id: taskId,
        values: measurements[taskId]!,
        date: completed[taskId]!,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [measurements, completed]);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <header className="flex min-w-0 flex-col gap-1">
        <Typography as="h2" align="start">
          Прогресс
        </Typography>

        <Typography align="start" tone="muted">
          Статистика тренировок, очки, уровни и личные замеры
        </Typography>
      </header>

      {/* Общая статистика */}
      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Всего очков">
          <Typography as="h2" align="start" className="text-blue-400">
            {total.toLocaleString('ru-RU')} XP
          </Typography>

          <Typography align="start" tone="muted" className="text-xs">
            Тренировки: {workoutXp} XP · Осанка: {postureXp} XP
          </Typography>
        </Card>

        <Card title="Текущий уровень">
          <div className="flex items-center gap-2">
            <Typography as="h3" align="start">
              {level.current?.title ?? 'Новичок'}
            </Typography>

            <Badge
              color="blue"
              text={`${level.progress === 1 ? '100' : Math.round(level.progress * 100)}%`}
            />
          </div>

          <Progress
            value={level.progress * 100}
            label={level.next ? `До уровня «${level.next.title}»` : 'Все уровни пройдены'}
            showValue={Boolean(level.next)}
            valueText={level.next ? `${level.xpToNext} XP` : 'Максимум'}
          />
        </Card>

        <Card title="Серия дней">
          <Typography as="h2" align="start">
            {streak} {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}
          </Typography>

          <Typography align="start" tone="muted" className="text-xs">
            Подряд выполнено обязательных задач
          </Typography>
        </Card>

        <Card title="Выполнено задач">
          <Typography as="h2" align="start">
            {completedTasks}
          </Typography>

          <Typography align="start" tone="muted" className="text-xs">
            Из {allTasks.length} задач обоих планов
          </Typography>
        </Card>
      </section>

      {/* Тренировочный план */}
      <Card title="Тренировочный план">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Typography as="h3" align="start">
              {completedWorkoutDays} из {PLAN_LENGTH_DAYS} дней
            </Typography>

            <Typography align="start" tone="muted" className="text-xs">
              Полностью выполненные дни
            </Typography>
          </div>

          <Typography as="h3" align="start" className="text-blue-400">
            {Math.round(workoutProgress)}%
          </Typography>
        </div>

        <Progress value={workoutProgress} color="green" size="lg" />

        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span>Выполнено задач: {completedTasks}</span>
          <span>
            Отжимания по плану: {workoutPlan.totals.pushupRepsPlanned.toLocaleString('ru-RU')}
          </span>
        </div>
      </Card>

      {/* Выбор дня и динамика XP */}
      <div className="flex w-full justify-center">
        <DaySwitcher day={day} onChange={setDay} className="w-full sm:w-auto" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <section className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <Card
            title={`День ${day} · ${selectedDate}`}
            headerRight={<Badge color="blue" text={`+${selectedXp} XP`} />}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography align="start" tone="muted">
                Обязательные задачи
              </Typography>

              <Typography align="start">
                {selectedProgress.done} из {selectedProgress.total}
              </Typography>
            </div>

            <Progress
              value={selectedProgress.done}
              max={selectedProgress.total || 1}
              color="green"
            />

            {selectedWorkoutDay && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  color={isDayComplete(selectedWorkoutDay, snapshot) ? 'green' : 'gray'}
                  text={
                    isDayComplete(selectedWorkoutDay, snapshot) ? 'День выполнен' : 'В процессе'
                  }
                />

                <Badge color="gray" text={selectedWorkoutDay.label} />
              </div>
            )}

            {selectedPostureDay && postureStartDate && (
              <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                <Typography align="start" className="font-semibold">
                  План осанки
                </Typography>

                <Typography align="start" tone="muted" className="text-sm">
                  Выполнено задач:{' '}
                  {selectedPostureDay.tasks.filter((task) => completed[task.id]).length}
                  {' из '}
                  {selectedPostureDay.tasks.length}
                </Typography>
              </div>
            )}
          </Card>

          <Card title="XP по дням">
            <Typography align="start" tone="muted" className="text-xs">
              Очки за тренировки и осанку за последние дни до выбранного дня
            </Typography>

            <BarChart data={weeklyXp} valueLabel="XP" height={220} />
          </Card>

          <Card title="Последние замеры">
            {latestMeasurement ? (
              <div className="flex flex-col gap-3">
                <Typography align="start" tone="muted" className="text-xs">
                  Последнее сохранение:{' '}
                  {new Date(latestMeasurement.date).toLocaleDateString('ru-RU')}
                </Typography>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(MEASUREMENT_LABELS).map(([key, field]) => {
                    const value = latestMeasurement.values[key];

                    if (!value) return null;

                    return (
                      <div
                        key={key}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 p-3"
                      >
                        <Typography align="start" tone="muted" className="text-sm">
                          {field.label}
                        </Typography>

                        <Typography className="shrink-0 font-semibold">
                          {value} {field.unit}
                        </Typography>
                      </div>
                    );
                  })}
                </div>

                {latestMeasurement.values.note && (
                  <div className="rounded-xl border border-white/10 p-3">
                    <Typography align="start" tone="muted" className="text-xs">
                      Заметка
                    </Typography>

                    <Typography align="start" className="text-sm">
                      {latestMeasurement.values.note}
                    </Typography>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Typography align="start">Замеров пока нет</Typography>

                <Typography align="start" tone="muted" className="text-sm">
                  Сохрани стартовые замеры в тренировочном плане, чтобы отслеживать изменения.
                </Typography>
              </div>
            )}
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <Card title="Календарь выполнения">
            <Calendar
              cells={calendarCells}
              selected={day}
              today={
                getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS).isBeforeStart
                  ? undefined
                  : currentDay
              }
              onSelect={setDay}
              leading={getIsoWeekday(startDate) - 1}
              weekdays={WEEKDAYS_SHORT}
            />

            <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500" />
                Выполнен
              </span>

              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-yellow-400" />
                Частично
              </span>

              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-400" />
                Пропущен
              </span>

              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-gray-500" />
                Отдых
              </span>
            </div>
          </Card>

          <Card title="План осанки">
            {postureStartDate ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-2">
                  <Typography as="h3" align="start">
                    {completedPostureDays} / {PLAN_LENGTH_DAYS}
                  </Typography>

                  <Typography align="start" tone="muted" className="text-xs">
                    дней выполнено
                  </Typography>
                </div>

                <Progress value={completedPostureDays} max={PLAN_LENGTH_DAYS} color="green" />

                <div className="border-t border-white/10 pt-3">
                  <Typography align="start" className="font-semibold">
                    {actualCorsetMinutes.toLocaleString('ru-RU')} мин
                  </Typography>

                  <Typography align="start" tone="muted" className="text-xs">
                    Фактическое время корсета
                  </Typography>
                </div>

                <Progress
                  value={actualCorsetMinutes}
                  max={plannedCorsetMinutes || 1}
                  label="Относительно плана"
                  showValue
                  valueText={`${Math.round((actualCorsetMinutes / (plannedCorsetMinutes || 1)) * 100)}%`}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Badge color="gray" text="Не начат" />

                <Typography align="start" tone="muted" className="text-sm">
                  План осанки пока не запущен. После начала здесь появится статистика выполнения и
                  времени корсета.
                </Typography>
              </div>
            )}
          </Card>

          <Card title="Уровни">
            <div className="flex flex-col gap-3">
              {gamification.levels.map((item) => {
                const unlocked = item.xp !== null && total >= item.xp;
                const isFinal = item.xp === null;

                return (
                  <div key={item.id} className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <Typography align="start" className="font-semibold">
                        {item.title}
                      </Typography>

                      <Typography align="start" tone="muted" className="text-xs">
                        {isFinal ? 'Финальное испытание' : `${item.xp} XP`}
                      </Typography>
                    </div>

                    <Badge
                      color={unlocked ? 'green' : 'gray'}
                      text={unlocked ? 'Открыт' : 'Закрыт'}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
