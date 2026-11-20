import { type Task, ExerciseDetails, getTaskTime } from '@/entities/plan';
import { MeasurementsButton } from '@/features/save-measurements';
import { MicroBreakCounter } from '@/features/micro-breaks';
import { ToggleTask } from '@/features/toggle-task';
import { TaskEditor } from './TaskEditor';

interface TaskItemProps {
  task: Task;
  day: number;
  workStartHour: number;
}

export function TaskItem({ task, day, workStartHour }: TaskItemProps) {
  if (task.type === 'micro-break') {
    return <MicroBreakCounter task={task} day={day} />;
  }

  if (task.type === 'measure') {
    return <MeasurementsButton task={task} />;
  }

  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="min-w-0 flex-1">
        <ToggleTask task={task} time={getTaskTime(task, workStartHour)} />
        <ExerciseDetails exerciseRef={task.exerciseRef} />
      </div>

      {task.type === 'custom' && task.groupId && (
        <TaskEditor day={day} groupId={task.groupId} task={task} />
      )}
    </div>
  );
}
