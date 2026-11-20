import { type Task, xpConfig } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Badge, IconButton, Progress, toast } from '@/shared/ui';
import { FaMinus, FaPlus } from 'react-icons/fa6';

interface MicroBreakCounterProps {
  task: Task;
  day: number;
}

function readTarget(task: Task): number {
  const count = task.target?.count;
  return typeof count === 'number' ? count : 8;
}

/** Счётчик микро-пауз за день: очки начисляются за каждую паузу до дневного лимита. */
export function MicroBreakCounter({ task, day }: MicroBreakCounterProps) {
  const count = useProgressStore((state) => state.microBreaks[day] ?? 0);
  const setMicroBreaks = useProgressStore((state) => state.setMicroBreaks);

  const target = readTarget(task);
  const perUnit = task.xpPerUnit ?? 0;
  const earned = Math.min(count, xpConfig.microBreakCap) * perUnit;

  const add = () => {
    setMicroBreaks(day, count + 1);
    if (count < xpConfig.microBreakCap) toast.success(`+${perUnit} XP: микро-пауза`);
    else toast.info('Лимит очков за паузы на сегодня достигнут');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex-between gap-3">
        <div className="flex flex-col">
          <span className="text-white">{task.title}</span>
          <span className="text-xs text-gray-400">Каждые 50 минут, по 2 минуты</span>
        </div>
        <Badge size="sm" color={earned > 0 ? 'green' : 'gray'} text={`+${earned} XP`} />
      </div>
      <div className="flex items-center gap-3">
        <IconButton
          size="sm"
          ariaLabel="Убрать микро-паузу"
          icon={<FaMinus />}
          disabled={count === 0}
          onClick={() => setMicroBreaks(day, count - 1)}
        />
        <Progress
          className="flex-1"
          value={count}
          max={target}
          valueText={`${count} из ${target}`}
          showValue
          color="green"
        />
        <IconButton
          size="sm"
          variant="primary"
          ariaLabel="Добавить микро-паузу"
          icon={<FaPlus />}
          onClick={add}
        />
      </div>
    </div>
  );
}
