import gamificationRaw from '@/shared/data/gamification.json';
import workoutRaw from '@/shared/data/plan-workout-30d.json';
import { gamificationSchema, workoutPlanSchema } from './schemas';
import type { WorkoutDay } from './types';

/** Данные проверяются Zod при загрузке. */
export const workoutPlan = workoutPlanSchema.parse(workoutRaw);
export const gamification = gamificationSchema.parse(gamificationRaw);

const workoutDays = new Map<number, WorkoutDay>(workoutPlan.days.map((day) => [day.day, day]));

export const getWorkoutDay = (day: number) => workoutDays.get(day);
