import { usePlanStore, xpConfig } from '@/entities/plan';
import { dayXp, useProgressStore } from '@/entities/progress';
import { BarChart, Button, Card, Typography } from '@/shared/ui';
import { useMemo } from 'react';

interface XpWeekChartProps {
  /** Последний день в окне из 7 дней */
  day: number;
  onSettingsClick: () => void;
}

export function XpWeekChart({ day, onSettingsClick }: XpWeekChartProps) {
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
    <Card classNameMain="rounded-2xl border-2 border-dotted border-amber-600 p-2 pl-10">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Typography as="h6" align="start" tone="accent" text="XP по дням" />

        <Button size="sm" variant="ghost" onClick={onSettingsClick}>
          Настроить
        </Button>
      </div>

      <BarChart data={data} valueLabel="XP" />
    </Card>
  );
}
