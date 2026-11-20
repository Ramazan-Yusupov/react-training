import { gamification, posturePlan, workoutPlan, xpConfig } from '@/entities/plan';
import {
  getCurrentDay,
  getLevelState,
  getStreak,
  totalXp,
  useProgressStore,
} from '@/entities/progress';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { todayISO } from '@/shared/lib';
import { useMemo } from 'react';

/** Общие очки (тренировки + осанка), уровень и серия дней. */
export function useXpSummary() {
  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);
  const startDate = useProgressStore((state) => state.startDate);

  return useMemo(() => {
    const snapshot = { completed, microBreaks };
    const xp =
      totalXp(workoutPlan.days, snapshot, xpConfig) +
      totalXp(posturePlan.days, snapshot, xpConfig, false);
    const level = getLevelState(xp, gamification.levels);
    const currentDay = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS).day;
    const streak = getStreak(workoutPlan.days, snapshot, currentDay);
    const reachedLevels = gamification.levels.filter(
      (item) => item.xp !== null && xp >= item.xp,
    ).length;
    return { xp, level, streak, reachedLevels };
  }, [completed, microBreaks, startDate]);
}
