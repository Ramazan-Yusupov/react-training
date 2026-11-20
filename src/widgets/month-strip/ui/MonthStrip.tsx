import { workoutPlan } from '@/entities/plan';
import {
  getCurrentDay,
  isDayComplete,
  requiredProgress,
  useProgressStore,
} from '@/entities/progress';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { WEEKDAYS_SHORT, getIsoWeekday, todayISO } from '@/shared/lib';
import { Calendar, type CalendarCell, Card } from '@/shared/ui';
import { useMemo } from 'react';

interface MonthStripProps {
  selected: number;
  onSelect: (day: number) => void;
}

/** 30 дней плана одной сеткой: выполнено, частично, пропущено. */
export function MonthStrip({ selected, onSelect }: MonthStripProps) {
  const startDate = useProgressStore((state) => state.startDate);
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const current = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS);

  const cells = useMemo<CalendarCell[]>(() => {
    const snapshot = { completed, microBreaks };
    return workoutPlan.days.map((day) => {
      const { done } = requiredProgress(day, snapshot);
      let status: CalendarCell['status'] = day.kind === 'rest' ? 'rest' : 'future';
      if (isDayComplete(day, snapshot)) status = 'done';
      else if (done > 0) status = 'partial';
      else if (!current.isBeforeStart && day.day < current.day) status = 'missed';
      return { value: day.day, status, hint: `День ${day.day}: ${day.label}` };
    });
  }, [completed, microBreaks, current.day, current.isBeforeStart]);

  return (
    <Card title="Месяц">
      <Calendar
        cells={cells}
        selected={selected}
        today={current.isBeforeStart ? undefined : current.day}
        onSelect={onSelect}
        leading={getIsoWeekday(startDate) - 1}
        weekdays={WEEKDAYS_SHORT}
      />
    </Card>
  );
}
