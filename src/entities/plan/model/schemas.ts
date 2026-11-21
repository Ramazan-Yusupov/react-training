import { z } from 'zod';

export const slotSchema = z.enum(['morning', 'workday', 'midday', 'afternoon', 'evening', 'night']);

export const taskTypeSchema = z.enum([
  'warmup',
  'pushup-set',
  'pullup-session',
  'body-block',
  'micro-break',
  'stretch',
  'walk',
  'mobility',
  'shadow-boxing',
  'max-test',
  'measure',
  'review',
  'corset-block',
  'posture-training',
  'light-training',
  'custom',
]);

export const workoutGroupSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
});

export const taskSchema = z.object({
  id: z.string(),
  type: taskTypeSchema,
  title: z.string(),
  durationMin: z.number(),
  xp: z.number(),
  required: z.boolean(),
  slot: slotSchema.optional(),
  groupId: z.string().optional(),
  originId: z.string().optional(),
  suggestedTime: z.string().optional(),
  xpPerUnit: z.number().optional(),
  target: z.record(z.string(), z.unknown()).optional(),
  fields: z.array(z.string()).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  optional: z.boolean().optional(),
  enabledByDefault: z.boolean().optional(),
  flexibleStart: z.boolean().optional(),
  startOffsetMin: z.number().optional(),
  note: z.string().optional(),
});

const weekSchema = z.object({
  week: z.number(),
  title: z.string(),
  goal: z.string(),
  peakReps: z.number().nullable().optional(),
});

export const workoutDaySchema = z.object({
  day: z.number(),
  week: z.number(),
  weekday: z.number(),
  kind: z.enum(['progress', 'light', 'rest', 'test']),
  label: z.string(),
  totalPushups: z.number().nullable(),
  groups: z.array(workoutGroupSchema).optional(),
  tasks: z.array(taskSchema),
});

const planBase = {
  schemaVersion: z.number(),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  durationDays: z.number(),
  startWeekday: z.number().nullable(),
  weeks: z.array(weekSchema),
};

export const workoutPlanSchema = z.object({
  ...planBase,
  type: z.literal('workout'),
  startDateSuggested: z.string(),
  slots: z.array(slotSchema),
  totals: z.object({
    pushupRepsPlanned: z.number(),
  }),
  days: z.array(workoutDaySchema),
});

export const gamificationSchema = z.object({
  schemaVersion: z.number(),
  xpByTaskType: z.record(z.string(), z.number()),
  microBreakDailyCap: z.number(),
  dayBonus: z.object({
    xp: z.number(),
    rule: z.string(),
  }),
  levels: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      xp: z.number().nullable(),
      unlockDay: z.number().optional(),
      reward: z.string().nullable(),
    }),
  ),
  streak: z.object({
    description: z.string(),
    minimumVersion: z.object({
      xp: z.number(),
      tasks: z.array(z.string()),
      keepsStreak: z.boolean(),
    }),
  }),
  motivationTips: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
    }),
  ),
});
