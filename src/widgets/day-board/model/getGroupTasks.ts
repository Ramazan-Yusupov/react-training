import type { PlanTask } from '@/entities/plan';

export function getGroupTasks(tasks: readonly PlanTask[], groupId: string) {
  return tasks
    .filter((task) => task.groupId === groupId)
    .sort((a, b) => {
      if (!a.scheduledTime) return b.scheduledTime ? 1 : 0;
      if (!b.scheduledTime) return -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
}
