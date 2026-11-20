import { type Task, ExerciseDetails, getTaskTime } from '@/entities/plan';
import { MeasurementsButton } from '@/features/save-measurements';
import { MicroBreakCounter } from '@/features/micro-breaks';
import { ToggleTask } from '@/features/toggle-task';

interface TaskItemProps {
  task: Task;
  day: number;
  workStartHour: number;
}

/** Выбирает подходящий вид строки под тип задачи. */
export function TaskItem({ task, day, workStartHour }: TaskItemProps) {
  if (task.type === 'micro-break') return <MicroBreakCounter task={task} day={day} />;
  if (task.type === 'measure') return <MeasurementsButton task={task} />;

  return (
    <div className="flex flex-col gap-2">
      <ToggleTask task={task} time={getTaskTime(task, workStartHour)} />
      <ExerciseDetails exerciseRef={task.exerciseRef} />
    </div>
  );
}
