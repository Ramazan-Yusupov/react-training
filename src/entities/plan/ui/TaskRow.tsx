import { Badge, Checkbox, Tooltip } from '@/shared/ui';
import type { PlanTask } from '../model/planSchema';

interface TaskRowProps {
  task: PlanTask;
  checked: boolean;
  onToggle: () => void;
  time?: string;
  xp?: number;
}

export function TaskRow({ task, checked, onToggle, xp = task.xp }: TaskRowProps) {
  const meta = [`${task.durationMin} мин`, task.scheduledTime].filter(Boolean).join(' | ');

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
