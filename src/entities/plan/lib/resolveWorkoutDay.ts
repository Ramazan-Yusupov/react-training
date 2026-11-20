import type { UserWorkoutPlanData } from '../model/userPlanSchema';

/**
 * Возвращает индивидуальную версию дня, если она существует.
 * В противном случае возвращает день из общего шаблона.
 */
export function resolveWorkoutDay(plan: UserWorkoutPlanData, day: number) {
  return plan.dayOverrides[String(day)] ?? plan.template.days.find((item) => item.day === day);
}
