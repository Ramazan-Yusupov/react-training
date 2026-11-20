import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { Button, Badge } from '@/shared/ui';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

interface DaySwitcherProps {
  day: number;
  onChange: (day: number) => void;
  className?: string;
}

/** Единый переключатель выбранного дня для тренировок и плана осанки. */
export function DaySwitcher({ day, onChange, className }: DaySwitcherProps) {
  const previousDay = () => {
    onChange(Math.max(1, day - 1));
  };

  const nextDay = () => {
    onChange(Math.min(PLAN_LENGTH_DAYS, day + 1));
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ''}`}>
      <Button variant="secondary" size="sm" disabled={day <= 1} onClick={previousDay}>
        <FaArrowLeft size={20} />
      </Button>

      <Badge color="blue" text={`День ${day} / ${PLAN_LENGTH_DAYS}`} />

      <Button variant="secondary" size="sm" disabled={day >= PLAN_LENGTH_DAYS} onClick={nextDay}>
        <FaArrowRight size={20} />
      </Button>
    </div>
  );
}
