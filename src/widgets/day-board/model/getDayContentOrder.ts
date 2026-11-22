import type { PlanContentOrderItem, PlanDay } from '@/entities/plan';

export function getDayContentOrder(planDay: PlanDay | undefined): PlanContentOrderItem[] {
  if (!planDay) return [];

  return (
    planDay.contentOrder ?? [
      ...planDay.groups.map((group) => ({
        type: 'group' as const,
        id: group.id,
      })),
      ...planDay.tasks
        .filter((task) => task.groupId === null)
        .map((task) => ({
          type: 'task' as const,
          id: task.id,
        })),
      ...planDay.widgets.map((widget) => ({
        type: 'widget' as const,
        id: widget.id,
      })),
    ]
  );
}
