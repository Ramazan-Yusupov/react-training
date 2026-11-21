import type { z } from 'zod';
import type {
  gamificationSchema,
  slotSchema,
  taskSchema,
  taskTypeSchema,
  workoutDaySchema,
  workoutGroupSchema,
  workoutPlanSchema,
} from './schemas';

export type Slot = z.infer<typeof slotSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type Task = z.infer<typeof taskSchema>;
export type WorkoutGroup = z.infer<typeof workoutGroupSchema>;
export type WorkoutDay = z.infer<typeof workoutDaySchema>;
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type Gamification = z.infer<typeof gamificationSchema>;
