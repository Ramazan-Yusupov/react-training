import { Badge, Checkbox, Tooltip } from '@/shared/ui';
import { describeTarget } from '../lib/describeTask';
import type { Task } from '../model/types';

interface TaskRowProps {
  task: Task;
  checked: boolean;
  onToggle: () => void;
  time?: string | undefined;
  xp?: number;
}

export function TaskRow({ task, checked, onToggle, time, xp = task.xp }: TaskRowProps) {
  const target = describeTarget(task);
  const meta = [time, `${task.durationMin} мин`, target].filter(Boolean).join(' · ');

  return (
    <Checkbox
      checked={checked}
      onChange={onToggle}
      label={task.title}
      description={meta}
      right={
        <Tooltip content={checked ? 'Очки получены' : 'Очки за выполнение'} side="bottom">
          <Badge size="sm" color={checked ? 'green' : 'gray'} text={`+${xp} XP`} />
        </Tooltip>
      }
    />
  );
}
