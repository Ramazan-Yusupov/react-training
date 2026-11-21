/**
 * Чистая логика очков, уровней и серии дней.
 * Прогресс задач и микро-пауз рассчитывается независимо.
 */

export interface TaskLike {
  id: string;
  xp: number;
  required: boolean;
}

export interface DayLike {
  day: number;
  tasks: TaskLike[];
}

export interface ProgressSnapshot {
  completed: Record<string, string>;
  microBreaks: Record<number, number>;
}

export interface XpConfig {
  microBreakCap: number;
  microBreakXp: number;
  dayBonus: number;
}

/** XP за выполнение обычной задачи. */
export function taskXp(task: TaskLike, snapshot: ProgressSnapshot): number {
  return snapshot.completed[task.id] ? task.xp : 0;
}

/** XP за микро-паузы с учётом дневного лимита. */
export function microBreakXp(day: number, snapshot: ProgressSnapshot, config: XpConfig): number {
  const count = Math.min(snapshot.microBreaks[day] ?? 0, config.microBreakCap);

  return count * config.microBreakXp;
}

/** День выполнен, если все обязательные задачи отмечены (и они вообще есть). */
export function isDayComplete(day: DayLike, snapshot: ProgressSnapshot): boolean {
  const required = day.tasks.filter((task) => task.required);
  return required.length > 0 && required.every((task) => Boolean(snapshot.completed[task.id]));
}

export function requiredProgress(day: DayLike, snapshot: ProgressSnapshot) {
  const required = day.tasks.filter((task) => task.required);
  const done = required.filter((task) => Boolean(snapshot.completed[task.id])).length;

  return { done, total: required.length };
}

export function dayXp(
  day: DayLike,
  snapshot: ProgressSnapshot,
  config: XpConfig,
  withBonus = true,
): number {
  const tasksXp = day.tasks.reduce((sum, task) => sum + taskXp(task, snapshot), 0);

  const breaksXp = microBreakXp(day.day, snapshot, config);
  const bonus = withBonus && isDayComplete(day, snapshot) ? config.dayBonus : 0;

  return tasksXp + breaksXp + bonus;
}

export function totalXp(
  days: DayLike[],
  snapshot: ProgressSnapshot,
  config: XpConfig,
  withBonus = true,
): number {
  return days.reduce((sum, day) => sum + dayXp(day, snapshot, config, withBonus), 0);
}

export interface LevelLike {
  id: string;
  title: string;
  xp: number | null;
}

export interface LevelState {
  current: LevelLike | null;
  next: LevelLike | null;
  /** 0..1 — прогресс до следующего уровня */
  progress: number;
  xpToNext: number;
}

export function getLevelState(xp: number, levels: readonly LevelLike[]): LevelState {
  const thresholds = levels
    .filter((level): level is LevelLike & { xp: number } => level.xp !== null)
    .sort((a, b) => a.xp - b.xp);

  const reached = thresholds.filter((level) => xp >= level.xp);
  const current = reached.at(-1) ?? null;
  const next = thresholds.find((level) => xp < level.xp) ?? null;

  if (!next) return { current, next: null, progress: 1, xpToNext: 0 };

  const from = current?.xp ?? 0;
  const progress = (xp - from) / (next.xp - from);

  return {
    current,
    next,
    progress: Math.min(Math.max(progress, 0), 1),
    xpToNext: next.xp - xp,
  };
}

/** Серия выполненных дней подряд, заканчивающаяся сегодня (или вчера, если сегодня ещё не закрыт). */
export function getStreak(days: DayLike[], snapshot: ProgressSnapshot, currentDay: number): number {
  const byNumber = new Map(days.map((day) => [day.day, day]));
  const isComplete = (dayNumber: number) => {
    const day = byNumber.get(dayNumber);
    return day ? isDayComplete(day, snapshot) : false;
  };

  let cursor = isComplete(currentDay) ? currentDay : currentDay - 1;
  let streak = 0;

  while (cursor >= 1 && isComplete(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}
