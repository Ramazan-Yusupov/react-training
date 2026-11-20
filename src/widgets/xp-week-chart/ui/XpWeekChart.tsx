import { workoutPlan, xpConfig } from '@/entities/plan';
import { dayXp, useProgressStore } from '@/entities/progress';
import { BarChart, Card } from '@/shared/ui';
import { useMemo } from 'react';

interface XpWeekChartProps {
  /** Последний день в окне из 7 дней */
  day: number;
}

export function XpWeekChart({ day }: XpWeekChartProps) {
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const data = useMemo(() => {
    const snapshot = { completed, microBreaks };
    const from = Math.max(1, day - 6);
    return workoutPlan.days
      .filter((item) => item.day >= from && item.day <= day)
      .map((item) => ({ label: `д${item.day}`, value: dayXp(item, snapshot, xpConfig) }));
  }, [completed, microBreaks, day]);

  return (
    <Card title="XP по дням">
      <BarChart data={data} valueLabel="XP" />
    </Card>
  );
}
