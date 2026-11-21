import { usePlanStore, xpConfig } from '@/entities/plan';
import { dayXp, useProgressStore } from '@/entities/progress';
import { BarChart, Card } from '@/shared/ui';
import { useMemo } from 'react';

interface XpWeekChartProps {
  /** Последний день в окне из 7 дней */
  day: number;
}

export function XpWeekChart({ day }: XpWeekChartProps) {
  const template = usePlanStore((state) => state.template);
  const dayOverrides = usePlanStore((state) => state.dayOverrides);

  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const data = useMemo(() => {
    const snapshot = { completed, microBreaks };
    const from = Math.max(1, day - 6);

    return template.days
      .map((item) => dayOverrides[String(item.day)] ?? item)
      .filter((item) => item.day >= from && item.day <= day)
      .map((item) => ({
        label: `д${item.day}`,
        value: dayXp(item, snapshot, xpConfig),
      }));
  }, [template.days, dayOverrides, completed, microBreaks, day]);

  return (
    <Card
      title="XP по дням"
      classNameMain="border-2 border-dotted border-amber-600 p-2 rounded-2xl"
    >
      <BarChart data={data} valueLabel="XP" />
    </Card>
  );
}
