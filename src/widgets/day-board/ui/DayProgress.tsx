import type { PlanDay } from '@/entities/plan';
import { xpConfig } from '@/entities/plan';
import { dayXp, isDayComplete, requiredProgress, useProgressStore } from '@/entities/progress';
import { Badge, Progress } from '@/shared/ui';
import { useMemo } from 'react';

export function DayProgress({ day }: { day: PlanDay }) {
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);

  const stats = useMemo(() => {
    const snapshot = { completed, microBreaks };

    return {
      progress: requiredProgress(day, snapshot),
      xp: dayXp(day, snapshot, xpConfig),
      isComplete: isDayComplete(day, snapshot),
    };
  }, [completed, microBreaks, day]);

  return (
    <div className="flex flex-col gap-2">
      <Progress
        value={stats.progress.done}
        max={Math.max(stats.progress.total, 1)}
        label="Обязательные задачи"
        showValue
        valueText={`${stats.progress.done} из ${stats.progress.total}`}
        color={stats.isComplete ? 'green' : 'blue'}
      />

      <div className="flex flex-wrap gap-2">
        <Badge color={stats.xp > 0 ? 'green' : 'gray'} text={`За день: ${stats.xp} XP`} />

        {stats.isComplete && (
          <Badge color="green" text={`День закрыт, бонус +${xpConfig.dayBonus} XP`} />
        )}
      </div>
    </div>
  );
}
