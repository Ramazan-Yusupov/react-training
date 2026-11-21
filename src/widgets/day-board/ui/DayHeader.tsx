import type { PlanDay } from '@/entities/plan';
import { addDays, formatDayMonth, getIsoWeekday, weekdayShort } from '@/shared/lib';
import { Typography } from '@/shared/ui';

interface DayHeaderProps {
  day: PlanDay;
  startDate: string;
  totalDays: number;
}

export function DayHeader({ day, startDate, totalDays }: DayHeaderProps) {
  const date = addDays(startDate, day.day - 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <Typography as="h3" align="start" text={`День ${day.day} из ${totalDays}`} />

        <Typography
          as="span"
          align="start"
          tone="muted"
          text={`${weekdayShort(getIsoWeekday(date))}, ${formatDayMonth(date)}`}
        />
      </div>
    </div>
  );
}
