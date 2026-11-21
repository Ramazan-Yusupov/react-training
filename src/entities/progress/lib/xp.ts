/**
 * Чистая логика очков, уровней и серии дней. Типы *Like описывают только нужные поля,
 * поэтому сущность не зависит от плана, а план подходит под них по структуре.
 */

export interface TaskLike {
  id: string;
  type?: string;
  xp: number;
  required: boolean;
  xpPerUnit?: number | undefined;
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
  dayBonus: number;
}

export function taskXp(
  task: TaskLike,
  day: number,
  snapshot: ProgressSnapshot,
  config: XpConfig,
): number {
  if (task.type === 'micro-break') {
    const count = Math.min(snapshot.microBreaks[day] ?? 0, config.microBreakCap);
    return count * (task.xpPerUnit ?? 0);
  }
  return snapshot.completed[task.id] ? task.xp : 0;
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
  const base = day.tasks.reduce((sum, task) => sum + taskXp(task, day.day, snapshot, config), 0);
  return withBonus && isDayComplete(day, snapshot) ? base + config.dayBonus : base;
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

export function getLevelState(xp: number, levels: LevelLike[]): LevelState {
  const thresholds = levels
    .filter((level): level is LevelLike & { xp: number } => level.xp !== null)
    .sort((a, b) => a.xp - b.xp);

  const reached = thresholds.filter((level) => xp >= level.xp);
  const current = reached.at(-1) ?? null;
  const next = thresholds.find((level) => xp < level.xp) ?? null;

  if (!next) return { current, next: null, progress: 1, xpToNext: 0 };

  const from = current?.xp ?? 0;
  const progress = (xp - from) / (next.xp - from);
  return { current, next, progress: Math.min(Math.max(progress, 0), 1), xpToNext: next.xp - xp };
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
