import { formatTaskDuration } from '@/shared/lib/format';
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
  const meta = [formatTaskDuration(task.durationMin), task.scheduledTime].filter(Boolean).join(' | ');
  const reward = (
    <Tooltip content={checked ? 'Очки получены' : 'Очки за выполнение'} side="bottom">
      <Badge
        size="sm"
        className="whitespace-nowrap max-sm:px-1.5 max-sm:text-[10px]"
        color={checked ? 'green' : 'gray'}
        text={`+${xp} XP`}
      />
    </Tooltip>
  );

  return (
    <Checkbox
      checked={checked}
      onChange={onToggle}
      label={
        <span className="block truncate" title={task.title}>
          {task.title}
        </span>
      }
      description={<span className="max-sm:text-[10px]">{meta}</span>}
      className={'max-sm:gap-x-1.5'}
      right={reward}
    />
  );
}
