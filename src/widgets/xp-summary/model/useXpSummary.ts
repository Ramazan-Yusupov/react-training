import { usePlanStore, xpConfig } from '@/entities/plan';
import {
  getCurrentDay,
  getProfileLevel,
  getStreak,
  totalXp,
  useProgressStore,
} from '@/entities/progress';
import { todayISO } from '@/shared/lib';
import { useMemo } from 'react';

/** XP, уровень и серия на основе пользовательского плана. */
export function useXpSummary() {
  const template = usePlanStore((state) => state.template);
  const dayOverrides = usePlanStore((state) => state.dayOverrides);

  const completed = useProgressStore((state) => state.completed);
  const microBreaks = useProgressStore((state) => state.microBreaks);
  const startDate = useProgressStore((state) => state.startDate);

  return useMemo(() => {
    const days = template.days.map((item) => dayOverrides[String(item.day)] ?? item);

    const snapshot = { completed, microBreaks };

    const xp = totalXp(days, snapshot, xpConfig);
    const level = getProfileLevel(xp);

    const currentDay = getCurrentDay(startDate, todayISO(), template.days.length).day;

    const streak = getStreak(days, snapshot, currentDay);

    return {
      xp,
      level,
      streak,
    };
  }, [template.days, dayOverrides, completed, microBreaks, startDate]);
}
