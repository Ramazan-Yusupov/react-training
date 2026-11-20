import exercisesRaw from '@/shared/data/exercises.json';
import gamificationRaw from '@/shared/data/gamification.json';
import postureRaw from '@/shared/data/plan-posture-30d.json';
import workoutRaw from '@/shared/data/plan-workout-30d.json';
import {
  exercisesSchema,
  gamificationSchema,
  posturePlanSchema,
  workoutPlanSchema,
} from './schemas';
import type { PostureDay, WorkoutDay } from './types';

/** Данные проверяются Zod при загрузке: битый JSON сразу даст понятную ошибку. */
export const workoutPlan = workoutPlanSchema.parse(workoutRaw);
export const posturePlan = posturePlanSchema.parse(postureRaw);
export const exercises = exercisesSchema.parse(exercisesRaw);
export const gamification = gamificationSchema.parse(gamificationRaw);

const workoutDays = new Map<number, WorkoutDay>(workoutPlan.days.map((day) => [day.day, day]));
const postureDays = new Map<number, PostureDay>(posturePlan.days.map((day) => [day.day, day]));

export const getWorkoutDay = (day: number) => workoutDays.get(day);
export const getPostureDay = (day: number) => postureDays.get(day);
