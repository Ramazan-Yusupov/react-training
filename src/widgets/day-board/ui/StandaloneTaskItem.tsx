import type { PlanTask } from '@/entities/plan';

import { TaskItem } from './TaskItem';

interface StandaloneTaskItemProps {
  task: PlanTask;
  day: number;
}

export function StandaloneTaskItem({ task, day }: StandaloneTaskItemProps) {
  return (
    <TaskItem
      task={task}
      day={day}
      className="rounded-2xl border-2 border-dashed border-slate-800 p-3 pl-10"
    />
  );
}
