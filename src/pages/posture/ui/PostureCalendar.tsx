import { posturePlan } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { addDays, todayISO, getIsoWeekday, WEEKDAYS_SHORT } from '@/shared/lib';
import { Calendar, type CalendarCell, Card, Typography } from '@/shared/ui';
import { useMemo } from 'react';

interface PostureCalendarProps {
  startDate: string;
  selected: number;
  currentDay?: number;
  onSelect: (day: number) => void;
}

export function PostureCalendar({ startDate, selected, currentDay, onSelect }: PostureCalendarProps) {
  const completed = useProgressStore((state) => state.completed);
  const corsetMinutes = useProgressStore((state) => state.corsetMinutes);

  const cells = useMemo<CalendarCell[]>(() => posturePlan.days.map((day) => {
    const required = day.tasks.filter((task) => task.required);
    const done = required.filter((task) => Boolean(completed[task.id])).length;
    const date = addDays(startDate, day.day - 1);
    let status: CalendarCell['status'] = 'future';

    if (day.corsetOff) status = 'rest';
    if (required.length > 0 && done === required.length) status = 'done';
    else if (done > 0 || (corsetMinutes[day.day] ?? 0) > 0) status = 'partial';
    else if (date < todayISO()) status = 'missed';

    return {
      value: day.day,
      status,
      hint: `День ${day.day} · ${day.corsetOff ? 'восстановление' : `${day.totalMinutesMorningOnly} мин утром`}`,
    };
  }), [completed, corsetMinutes, startDate]);

  return (
    <Card title="Календарь · 30 дней">
      <Calendar
        cells={cells}
        selected={selected}
        today={currentDay}
        onSelect={onSelect}
        leading={getIsoWeekday(startDate) - 1}
        weekdays={WEEKDAYS_SHORT}
      />
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-400" />Выполнен</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-yellow-400" />Частично</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-400" />Пропущен</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gray-500" />Восстановление</span>
      </div>
      <Typography align="start" tone="muted" className="text-xs">
        Выбери дату, чтобы открыть расписание и отметить фактическое выполнение.
      </Typography>
    </Card>
  );
}
