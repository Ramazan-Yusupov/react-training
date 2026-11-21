import type { PlanDay } from '@/entities/plan';
import { usePlanDayActions } from '@/features/manage-plan-days';
import { addDays, formatDayMonth, getIsoWeekday, weekdayShort } from '@/shared/lib';
import { Button, Typography } from '@/shared/ui';
import { FaMinus, FaPlus } from 'react-icons/fa6';

interface DayHeaderProps {
  day: PlanDay;
  startDate: string;
  totalDays: number;
  onChange: (day: number) => void;
}

export function DayHeader({ day, startDate, totalDays, onChange }: DayHeaderProps) {
  const date = addDays(startDate, day.day - 1);

  const { handleAddDay, handleRemoveLastDay } = usePlanDayActions({
    day: day.day,
    onChange,
  });

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

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleAddDay}>
          <FaPlus size={14} />
          <span className="sr-only">Добавить день</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={totalDays <= 1}
          onClick={handleRemoveLastDay}
        >
          <FaMinus size={14} />
          <span className="sr-only">Удалить последний день</span>
        </Button>
      </div>
    </div>
  );
}
