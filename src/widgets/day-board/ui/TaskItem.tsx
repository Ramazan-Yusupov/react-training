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
  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="min-w-0 flex-1">
        {task.type === 'micro-break' ? (
          <MicroBreakCounter task={task} day={day} />
        ) : task.type === 'measure' ? (
          <MeasurementsButton task={task} />
        ) : (
          <>
            <ToggleTask task={task} time={getTaskTime(task, workStartHour)} />
            <ExerciseDetails exerciseRef={task.exerciseRef} />
          </>
        )}
      </div>

      <TaskEditor day={day} task={task} groupId={task.groupId} />
    </div>
  );
}
