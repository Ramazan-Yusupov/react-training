import { levels, usePlanStore, xpConfig } from '@/entities/plan';
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
import { useSelectedDay } from '@/features/select-day';
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
import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DAYS_PER_PERIOD = 30;

function addDaysToISODate(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);

  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return dateString;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export function ProgressPage() {
  const { day, setDay, currentDay } = useSelectedDay();

  const template = usePlanStore((state) => state.template);
  const dayOverrides = usePlanStore((state) => state.dayOverrides);
  const totalDays = template.days.length;

  const startDate = useProgressStore((state) => state.startDate);
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const periodsCount = Math.ceil(totalDays / DAYS_PER_PERIOD);

  const [periodIndex, setPeriodIndex] = useState(() => Math.floor((day - 1) / DAYS_PER_PERIOD));

  useEffect(() => {
    setPeriodIndex(Math.floor((day - 1) / DAYS_PER_PERIOD));
  }, [day]);

  useEffect(() => {
    setPeriodIndex((current) => Math.min(current, Math.max(0, periodsCount - 1)));
  }, [periodsCount]);

  const days = useMemo(
    () => template.days.map((item) => dayOverrides[String(item.day)] ?? item),
    [template.days, dayOverrides],
  );

  const snapshot = useMemo(() => ({ completed, microBreaks }), [completed, microBreaks]);

  const total = useMemo(() => totalXp(days, snapshot, xpConfig), [days, snapshot]);

  const level = getLevelState(total, levels);
  const streak = getStreak(days, snapshot, currentDay);

  const allTasks = days.flatMap((item) => item.tasks);
  const completedTasks = allTasks.filter((task) => completed[task.id]).length;

  const completedDays = days.filter((item) => isDayComplete(item, snapshot)).length;

  const selectedDay = days.find((item) => item.day === day);
  const selectedProgress = selectedDay
    ? requiredProgress(selectedDay, snapshot)
    : { done: 0, total: 0 };

  const selectedXp = selectedDay ? dayXp(selectedDay, snapshot, xpConfig) : 0;

  const selectedDate = formatDayMonth(addDays(startDate, day - 1));

  const calendarCells = useMemo<CalendarCell[]>(
    () =>
      days.map((item) => {
        const progress = requiredProgress(item, snapshot);

        let status: CalendarCell['status'] = 'future';

        if (isDayComplete(item, snapshot)) {
          status = 'done';
        } else if (progress.done > 0) {
          status = 'partial';
        } else if (item.day < currentDay) {
          status = 'missed';
        }

        return {
          value: item.day,
          status,
          hint: `День ${item.day}`,
        };
      }),
    [days, snapshot, currentDay],
  );

  const periodStart = periodIndex * DAYS_PER_PERIOD + 1;
  const periodEnd = Math.min(periodStart + DAYS_PER_PERIOD - 1, totalDays);

  const visibleCells = useMemo(
    () => calendarCells.filter((cell) => cell.value >= periodStart && cell.value <= periodEnd),
    [calendarCells, periodStart, periodEnd],
  );

  const periodStartDate = useMemo(
    () => addDaysToISODate(startDate, periodStart - 1),
    [startDate, periodStart],
  );

  const handlePreviousPeriod = () => {
    setPeriodIndex((current) => Math.max(0, current - 1));
  };

  const handleNextPeriod = () => {
    setPeriodIndex((current) => Math.min(periodsCount - 1, current + 1));
  };

  const weeklyXp = useMemo(() => {
    const from = Math.max(1, day - 6);

    return Array.from({ length: day - from + 1 }, (_, index) => {
      const dayNumber = from + index;
      const current = days.find((item) => item.day === dayNumber);

      return {
        label: `д${dayNumber}`,
        value: current ? dayXp(current, snapshot, xpConfig) : 0,
      };
    });
  }, [day, days, snapshot]);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <header className="flex min-w-0 flex-col gap-1">
        <Typography as="h2" align="start">
          Прогресс
        </Typography>

        <Typography align="start" tone="muted">
          Статистика выполнения задач и достижения
        </Typography>
      </header>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Всего очков">
          <Typography as="h2" align="start" className="text-blue-400">
            {total.toLocaleString('ru-RU')} XP
          </Typography>

          <Typography align="start" tone="muted" className="text-xs">
            За выполненные задачи
          </Typography>
        </Card>

        <Card title="Текущий уровень">
          <div className="flex items-center gap-2">
            <Typography as="h3" align="start">
              {level.current?.title ?? 'Новичок'}
            </Typography>

            <Badge color="blue" text={`${Math.round(level.progress * 100)}%`} />
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
            Подряд выполнены обязательные задачи
          </Typography>
        </Card>

        <Card title="Выполнено задач">
          <Typography as="h2" align="start">
            {completedTasks}
          </Typography>

          <Typography align="start" tone="muted" className="text-xs">
            Из {allTasks.length} задач
          </Typography>
        </Card>
      </section>

      <Card title="Общая активность">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Typography as="h3" align="start">
              {completedDays} из {totalDays} дней
            </Typography>

            <Typography align="start" tone="muted" className="text-xs">
              Дни, в которых выполнены все обязательные задачи
            </Typography>
          </div>

          <Typography as="h3" align="start" className="text-blue-400">
            {Math.round((completedDays / totalDays) * 100)}%
          </Typography>
        </div>

        <Progress value={completedDays} max={totalDays} color="green" size="lg" />
      </Card>

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

            {selectedDay && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  color={isDayComplete(selectedDay, snapshot) ? 'green' : 'gray'}
                  text={isDayComplete(selectedDay, snapshot) ? 'День выполнен' : 'В процессе'}
                />

                <Badge color="gray" text={`Всего задач: ${selectedDay.tasks.length}`} />
              </div>
            )}
          </Card>

          <Card title="XP по дням">
            <Typography align="start" tone="muted" className="text-xs">
              Очки за последние дни до выбранного дня
            </Typography>

            <BarChart data={weeklyXp} valueLabel="XP" height={220} />
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <Card
            title="Календарь активности"
            headerRight={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPeriod}
                  disabled={periodIndex === 0}
                  aria-label="Предыдущие 30 дней"
                  className="flex-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FaChevronLeft size={12} />
                </button>

                <span className="whitespace-nowrap text-xs font-medium text-gray-300">
                  Дни {periodStart}–{periodEnd}
                </span>

                <button
                  type="button"
                  onClick={handleNextPeriod}
                  disabled={periodIndex >= periodsCount - 1}
                  aria-label="Следующие 30 дней"
                  className="flex-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            }
          >
            <Calendar
              cells={visibleCells}
              selected={day}
              today={
                getCurrentDay(startDate, todayISO(), totalDays).isBeforeStart
                  ? undefined
                  : currentDay
              }
              onSelect={setDay}
              leading={getIsoWeekday(periodStartDate) - 1}
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
                Будущий
              </span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
