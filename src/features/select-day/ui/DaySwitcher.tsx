import { usePlanStore } from '@/entities/plan';
import { usePlanDayActions } from '@/features/manage-plan-days';
import { Badge, Button } from '@/shared/ui';
import { FaArrowLeft, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa6';

interface DaySwitcherProps {
  day: number;
  onChange: (day: number) => void;
  className?: string;
}

/** Переключение и управление днями пользовательского плана. */
export function DaySwitcher({ day, onChange, className }: DaySwitcherProps) {
  const totalDays = usePlanStore((state) => state.template.days.length);

  const { handleAddDay, handleRemoveLastDay } = usePlanDayActions({
    day,
    onChange,
  });

  const previousDay = () => {
    onChange(Math.max(1, day - 1));
  };

  const nextDay = () => {
    onChange(Math.min(totalDays, day + 1));
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ''}`}>
      <Button variant="secondary" size="sm" disabled={day <= 1} onClick={previousDay}>
        <FaArrowLeft size={16} />
      </Button>

      <Badge color="blue" text={`День ${day} / ${totalDays}`} />

      <Button variant="secondary" size="sm" disabled={day >= totalDays} onClick={nextDay}>
        <FaArrowRight size={16} />
      </Button>

      <div className="ml-2 flex items-center gap-1">
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
