import type { PlanTask } from '@/entities/plan';
import { ToggleTask } from '@/features/toggle-task';

import { TaskEditor } from './TaskEditor';

interface TaskItemProps {
  task: PlanTask;
  day: number;
}

export function TaskItem({ task, day }: TaskItemProps) {
  const isStandalone = task.groupId === null;

  return (
    <div
      className={`flex min-w-0 items-start gap-2 ${
        isStandalone ? 'rounded-2xl border-2 border-dashed border-slate-800 p-3 pl-10' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <ToggleTask task={task} />
      </div>

      <TaskEditor day={day} task={task} groupId={task.groupId ?? undefined} />
    </div>
  );
}
