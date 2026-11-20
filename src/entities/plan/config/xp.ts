import { gamification } from '../model/plans';

/** Параметры подсчёта очков из gamification.json */
export const xpConfig = {
  microBreakCap: gamification.microBreakDailyCap,
  dayBonus: gamification.dayBonus.xp,
};
