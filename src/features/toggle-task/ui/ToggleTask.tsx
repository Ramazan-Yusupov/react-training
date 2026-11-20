import { type Task, TaskRow } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { toast } from '@/shared/ui';

interface ToggleTaskProps {
  task: Task;
  time?: string | undefined;
}

/** Строка задачи с чекбоксом: отмечает выполнение и показывает полученные очки. */
export function ToggleTask({ task, time }: ToggleTaskProps) {
  const checked = useProgressStore((state) => Boolean(state.completed[task.id]));
  const toggleTask = useProgressStore((state) => state.toggleTask);

  const handleToggle = () => {
    const isDone = toggleTask(task.id);
    if (isDone) toast.success(`+${task.xp} XP: ${task.title}`);
    else toast.info(`Отметка снята: −${task.xp} XP`);
  };

  return <TaskRow task={task} checked={checked} onToggle={handleToggle} time={time} />;
}
