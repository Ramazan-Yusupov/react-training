import { getCurrentDay, useProgressStore } from '@/entities/progress';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { formatDayMonth, todayISO } from '@/shared/lib';
import { Button, Card, Typography, toast } from '@/shared/ui';

/** Показывается, пока план не начался или уже закончился. */
export function StartPlanBanner() {
  const startDate = useProgressStore((state) => state.startDate);
  const startWorkoutToday = useProgressStore((state) => state.startWorkoutToday);

  const { isBeforeStart, isAfterEnd } = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS);
  if (!isBeforeStart && !isAfterEnd) return null;

  const start = () => {
    startWorkoutToday();
    toast.success('План начат: сегодня день 1');
  };

  return (
    <Card
      border="2px"
      borderColor="rgb(59 130 246 / 0.5)"
      footer={<Button variant="primary" title="Начать сегодня" onClick={start} />}
    >
      <Typography
        as="p"
        align="start"
        text={
          isBeforeStart
            ? `План начнётся ${formatDayMonth(startDate)}. Можно начать сегодня: тогда сегодня будет день 1.`
            : 'Все 30 дней плана позади. Можно начать план заново с сегодняшнего дня.'
        }
      />
    </Card>
  );
}
