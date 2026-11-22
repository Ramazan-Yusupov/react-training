import type { PlanTask } from '@/entities/plan';
import { ToggleTask } from '@/features/toggle-task';

import { TaskEditor } from './TaskEditor';

interface TaskItemProps {
  task: PlanTask;
  day: number;
  className?: string;
}

export function TaskItem({ task, day, className = '' }: TaskItemProps) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <div className="min-w-0 flex-1">
        <ToggleTask task={task} />
      </div>

      <TaskEditor day={day} task={task} groupId={task.groupId ?? undefined} />
    </div>
  );
}
