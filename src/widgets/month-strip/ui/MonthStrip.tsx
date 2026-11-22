import { usePlanStore } from '@/entities/plan';
import {
  getCurrentDay,
  isDayComplete,
  requiredProgress,
  useProgressStore,
} from '@/entities/progress';
import { WEEKDAYS_SHORT, getIsoWeekday, todayISO } from '@/shared/lib';
import { Calendar, type CalendarCell, Card } from '@/shared/ui';
import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface MonthStripProps {
  selected: number;
  onSelect: (day: number) => void;
}

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

export function MonthStrip({ selected, onSelect }: MonthStripProps) {
  const template = usePlanStore((state) => state.template);
  const dayOverrides = usePlanStore((state) => state.dayOverrides);

  const startDate = useProgressStore((state) => state.startDate);
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const totalDays = template.days.length;
  const periodsCount = Math.ceil(totalDays / DAYS_PER_PERIOD);

  const [periodIndex, setPeriodIndex] = useState(() =>
    Math.floor((selected - 1) / DAYS_PER_PERIOD),
  );

  useEffect(() => {
    setPeriodIndex(Math.floor((selected - 1) / DAYS_PER_PERIOD));
  }, [selected]);

  useEffect(() => {
    setPeriodIndex((current) => Math.min(current, Math.max(0, periodsCount - 1)));
  }, [periodsCount]);

  const current = getCurrentDay(startDate, todayISO(), totalDays);

  const cells = useMemo<CalendarCell[]>(() => {
    const snapshot = { completed, microBreaks };
    const days = template.days.map((item) => dayOverrides[String(item.day)] ?? item);

    return days.map((day) => {
      const { done } = requiredProgress(day, snapshot);
      let status: CalendarCell['status'] = 'future';

      if (isDayComplete(day, snapshot)) {
        status = 'done';
      } else if (done > 0) {
        status = 'partial';
      } else if (!current.isBeforeStart && day.day < current.day) {
        status = 'missed';
      }

      return { value: day.day, status, hint: `День ${day.day}` };
    });
  }, [template.days, dayOverrides, completed, microBreaks, current.day, current.isBeforeStart]);

  const periodStart = periodIndex * DAYS_PER_PERIOD + 1;
  const periodEnd = Math.min(periodStart + DAYS_PER_PERIOD - 1, totalDays);

  const visibleCells = useMemo(
    () => cells.filter((cell) => cell.value >= periodStart && cell.value <= periodEnd),
    [cells, periodStart, periodEnd],
  );

  const periodStartDate = useMemo(
    () => addDaysToISODate(startDate, periodStart - 1),
    [startDate, periodStart],
  );

  const handlePreviousPeriod = () => {
    setPeriodIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const handleNextPeriod = () => {
    setPeriodIndex((currentIndex) => Math.min(periodsCount - 1, currentIndex + 1));
  };

  return (
    <Card
      title="Активность"
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
        selected={selected}
        today={current.isBeforeStart ? undefined : current.day}
        onSelect={onSelect}
        leading={getIsoWeekday(periodStartDate) - 1}
        weekdays={WEEKDAYS_SHORT}
      />
    </Card>
  );
}
