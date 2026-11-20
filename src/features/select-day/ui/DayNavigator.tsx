import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { addDays, formatDayMonth, getIsoWeekday, weekdayShort } from '@/shared/lib';
import { IconButton, Select } from '@/shared/ui';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

interface DayNavigatorProps {
  day: number;
  startDate: string;
  onChange: (day: number) => void;
}

const DAYS = Array.from({ length: PLAN_LENGTH_DAYS }, (_, index) => index + 1);

/** Переход по дням: кнопки «назад / вперёд» и список всех 30 дней. */
export function DayNavigator({ day, startDate, onChange }: DayNavigatorProps) {
  const options = DAYS.map((value) => {
    const date = addDays(startDate, value - 1);
    return {
      value,
      label: `День ${value} · ${weekdayShort(getIsoWeekday(date))} · ${formatDayMonth(date)}`,
    };
  });

  return (
    <div className="flex items-center gap-2">
      <IconButton
        ariaLabel="Предыдущий день"
        icon={<FaChevronLeft />}
        disabled={day <= 1}
        onClick={() => onChange(day - 1)}
      />
      <Select
        aria-label="День плана"
        wrapperClassName="flex-1"
        value={day}
        options={options}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <IconButton
        ariaLabel="Следующий день"
        icon={<FaChevronRight />}
        disabled={day >= PLAN_LENGTH_DAYS}
        onClick={() => onChange(day + 1)}
      />
    </div>
  );
}
