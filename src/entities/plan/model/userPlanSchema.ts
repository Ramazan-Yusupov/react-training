import { z } from 'zod';
import { workoutDaySchema, workoutPlanSchema } from './schemas';

/**
 * Пользовательский план:
 * - template — основной план на все 30 дней;
 * - dayOverrides — индивидуальные изменения отдельных дней.
 */
export const userWorkoutPlanSchema = z.object({
  schemaVersion: z.number(),
  template: workoutPlanSchema,
  dayOverrides: z.record(z.string(), workoutDaySchema),
});

export type UserWorkoutPlanData = z.infer<typeof userWorkoutPlanSchema>;
