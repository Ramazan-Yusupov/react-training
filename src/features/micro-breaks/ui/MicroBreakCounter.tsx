import { xpConfig } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Badge, IconButton, Progress, toast } from '@/shared/ui';
import { FaMinus, FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

interface MicroBreakCounterProps {
  day: number;
  onDeleteClick: () => void;
  onEditClick: () => void;
}

/** Самостоятельный счётчик микро-пауз за день. */
export function MicroBreakCounter({ day, onEditClick, onDeleteClick }: MicroBreakCounterProps) {
  const count = useProgressStore((state) => state.microBreaks[day] ?? 0);
  const setMicroBreaks = useProgressStore((state) => state.setMicroBreaks);

  const target = xpConfig.microBreakCap;
  const earned = Math.min(count, target) * xpConfig.microBreakXp;

  const add = () => {
    setMicroBreaks(day, count + 1);

    if (count < target) {
      toast.success(`+${xpConfig.microBreakXp} XP: микро-пауза`);
    } else {
      toast.info('Лимит очков за паузы на сегодня достигнут');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-white">Микро-паузы</span>
          <span className="text-xs text-gray-400">Каждые 50 минут, по 2 минуты</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge size="sm" color={earned > 0 ? 'green' : 'gray'} text={`+${earned} XP`} />
          <IconButton
            size="sm"
            variant="ghost"
            ariaLabel="Редактировать виджет микро-пауз"
            icon={<FaPen />}
            onClick={onEditClick}
          />
          <IconButton size="sm" variant="dangerGhost" ariaLabel="Удалить виджет микро-пауз" icon={<FaTrash />} onClick={onDeleteClick} />
        </div>
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
