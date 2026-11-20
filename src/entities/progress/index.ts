export { useProgressStore, createInitialProgress } from './model/store';
export type { ProgressData } from './model/store';
export {
  taskXp,
  dayXp,
  totalXp,
  isDayComplete,
  requiredProgress,
  getLevelState,
  getStreak,
} from './lib/xp';
export type {
  DayLike,
  TaskLike,
  XpConfig,
  LevelLike,
  LevelState,
  ProgressSnapshot,
} from './lib/xp';
export { getCurrentDay } from './lib/currentDay';
