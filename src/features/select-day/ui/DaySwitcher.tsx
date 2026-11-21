import { usePlanStore } from '@/entities/plan';
import { Badge, Button } from '@/shared/ui';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

interface DaySwitcherProps {
  day: number;
  onChange: (day: number) => void;
  className?: string;
}

/** Переключение и управление днями пользовательского плана. */
export function DaySwitcher({ day, onChange, className }: DaySwitcherProps) {
  const totalDays = usePlanStore((state) => state.template.days.length);

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
    </div>
  );
}
