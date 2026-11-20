import { gamification, xpConfig, useUserWorkoutPlanStore } from '@/entities/plan';
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

/** XP, уровень и серия на основе пользовательского плана. */
export function useXpSummary() {
  const template = useUserWorkoutPlanStore((state) => state.template);
  const dayOverrides = useUserWorkoutPlanStore((state) => state.dayOverrides);

  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);
  const startDate = useProgressStore((state) => state.startDate);

  return useMemo(() => {
    const days = template.days.map((item) => dayOverrides[String(item.day)] ?? item);

    const snapshot = { completed, microBreaks };

    const xp = totalXp(days, snapshot, xpConfig);
    const level = getLevelState(xp, gamification.levels);

    const currentDay = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS).day;

    const streak = getStreak(days, snapshot, currentDay);

    const reachedLevels = gamification.levels.filter(
      (item) => item.xp !== null && xp >= item.xp,
    ).length;

    return {
      xp,
      level,
      streak,
      reachedLevels,
      levels: gamification.levels,
    };
  }, [template.days, dayOverrides, completed, microBreaks, startDate]);
}
