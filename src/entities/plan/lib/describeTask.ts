import { addMinutesToTime } from '@/shared/lib';
import { z } from 'zod';
import type { Task } from '../model/types';

const pullTargetSchema = z.object({
  mainSets: z.number(),
  mainReps: z.string(),
  negSets: z.number(),
  negReps: z.number(),
  negSeconds: z.number(),
  hangSets: z.number(),
  hangSeconds: z.number(),
});
const repsSchema = z.object({ reps: z.number() });
const countSchema = z.object({ count: z.number() });
const roundsSchema = z.object({ rounds: z.number(), roundMin: z.number() });

/** Короткое описание цели задачи: "14 повторов", "3×2–3 + негативные 2×3 (4 с) + вис 1×20 с". */
export function describeTarget(task: Task): string | null {
  if (!task.target) return null;

  switch (task.type) {
    case 'pushup-set': {
      const parsed = repsSchema.safeParse(task.target);
      return parsed.success ? `${parsed.data.reps} повторов` : null;
    }
    case 'pullup-session': {
      const parsed = pullTargetSchema.safeParse(task.target);
      if (!parsed.success) return null;
      const t = parsed.data;
      const reps = t.mainReps.replace('-', '–');
      return `${t.mainSets}×${reps} + негативные ${t.negSets}×${t.negReps} (${t.negSeconds} с) + вис ${t.hangSets}×${t.hangSeconds} с`;
    }
    case 'micro-break': {
      const parsed = countSchema.safeParse(task.target);
      return parsed.success ? `${parsed.data.count} раз за день` : null;
    }
    case 'shadow-boxing': {
      const parsed = roundsSchema.safeParse(task.target);
      return parsed.success ? `${parsed.data.rounds} раунд × ${parsed.data.roundMin} мин` : null;
    }
    default:
      return null;
  }
}

/** Время задачи: для гибкого старта (корсет) считается от времени начала работы. */
export function getTaskTime(task: Task, workStartHour: number): string | undefined {
  if (task.flexibleStart && task.startOffsetMin !== undefined) {
    const start = addMinutesToTime(
      `${String(workStartHour).padStart(2, '0')}:00`,
      task.startOffsetMin,
    );
    return `${start}–${addMinutesToTime(start, task.durationMin)}`;
  }
  if (task.start && task.end) return `${task.start}–${task.end}`;
  return task.suggestedTime;
}
