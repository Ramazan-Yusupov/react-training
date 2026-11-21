import { z } from 'zod';

export const planGroupSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1),
});

export const planTaskSchema = z.object({
  id: z.string(),
  originId: z.string().optional(),
  title: z.string().trim().min(1),
  durationMin: z.number().min(0),
  xp: z.number().min(0),
  required: z.boolean(),
  groupId: z.string().nullable(),
  scheduledTime: z.string().optional(),
});

/** Элементы верхнего уровня в порядке отображения дня. */
export const planContentOrderItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('group'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('task'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('widget'),
    id: z.string(),
  }),
]);

export const planDaySchema = z.object({
  day: z.number().int().positive(),
  groups: z.array(planGroupSchema),
  tasks: z.array(planTaskSchema),

  // Пока optional для совместимости со старыми сохранёнными планами.
  contentOrder: z.array(planContentOrderItemSchema).optional(),
});

export const planTemplateSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1),
  description: z.string(),
  days: z.array(planDaySchema).min(1),
});

export const userPlanSchema = z.object({
  schemaVersion: z.number(),
  template: planTemplateSchema,
  dayOverrides: z.record(z.string(), planDaySchema),
});

export type PlanGroup = z.infer<typeof planGroupSchema>;
export type PlanTask = z.infer<typeof planTaskSchema>;
export type PlanContentOrderItem = z.infer<typeof planContentOrderItemSchema>;
export type PlanDay = z.infer<typeof planDaySchema>;
export type PlanTemplate = z.infer<typeof planTemplateSchema>;
export type UserPlanData = z.infer<typeof userPlanSchema>;
