import { useUserWorkoutPlanStore } from '@/entities/plan';
import {
  getCurrentDay,
  isDayComplete,
  requiredProgress,
  useProgressStore,
} from '@/entities/progress';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { addDays, getIsoWeekday, todayISO, WEEKDAYS_SHORT } from '@/shared/lib';
import { Calendar, type CalendarCell, Card, Typography } from '@/shared/ui';
import { useMemo } from 'react';

interface PlanCalendarProps {
  selected: number;
  onSelect: (day: number) => void;
}

export function PlanCalendar({ selected, onSelect }: PlanCalendarProps) {
  const startDate = useProgressStore((state) => state.startDate);
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const templateDays = useUserWorkoutPlanStore((state) => state.template.days);
  const dayOverrides = useUserWorkoutPlanStore((state) => state.dayOverrides);

  const current = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS);

  const cells = useMemo<CalendarCell[]>(() => {
    const snapshot = { completed, microBreaks };

    const days = templateDays.map((day) => dayOverrides[String(day.day)] ?? day);

    return days.map((day) => {
      const { done, total } = requiredProgress(day, snapshot);
      const date = addDays(startDate, day.day - 1);

      let status: CalendarCell['status'] = 'future';

      if (day.kind === 'rest') status = 'rest';

      if (isDayComplete(day, snapshot)) {
        status = 'done';
      } else if (done > 0) {
        status = 'partial';
      } else if (date < todayISO()) {
        status = 'missed';
      }

      return {
        value: day.day,
        status,
        hint: `День ${day.day} · ${day.label || 'Отдых'} · ${done} из ${total} обязательных задач`,
      };
    });
  }, [completed, microBreaks, startDate, templateDays, dayOverrides]);

  return (
    <Card title="Все 30 дней">
      <Calendar
        cells={cells}
        selected={selected}
        today={current.isBeforeStart ? undefined : current.day}
        onSelect={onSelect}
        leading={getIsoWeekday(startDate) - 1}
        weekdays={WEEKDAYS_SHORT}
      />

      <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-green-400" />
          Выполнен
        </span>

        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-yellow-400" />
          Частично
        </span>

        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-red-400" />
          Пропущен
        </span>

        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-gray-500" />
          Отдых
        </span>
      </div>

      <Typography as="span" align="start" tone="muted">
        Выбери день, чтобы посмотреть его задачи и упражнения.
      </Typography>
    </Card>
  );
}
