import { Badge, Card, Progress, Tooltip, Typography, toast } from '@/shared/ui';
import { useEffect, useRef } from 'react';
import { FaFire } from 'react-icons/fa6';
import { useXpSummary } from '../model/useXpSummary';

export function XpSummary() {
  const { xp, level, streak } = useXpSummary();
  const previousLevels = useRef(level.number);
  const levelTitle = level.rank.title;

  // Уведомление о новом уровне (только при росте, не при снятии отметок)
  useEffect(() => {
    if (level.number > previousLevels.current && levelTitle) {
      toast.success(`Новый уровень: ${levelTitle}!`);
    }
    previousLevels.current = level.number;
  }, [level.number, levelTitle]);

  return (
    <Card
      title="Очки и уровень"
      headerRight={
        <Tooltip content="Дней подряд, когда выполнены все обязательные задачи" side="bottom">
          <Badge
            color={streak > 0 ? 'yellow' : 'gray'}
            icon={<FaFire />}
            text={`Серия: ${streak}`}
          />
        </Tooltip>
      }
    >
      <div className="flex items-end justify-between gap-3">
        <Typography as="h2" align="start" text={`${xp} XP`} />
        <Badge color="blue" text={`${level.number} ур. · ${level.rank.title}`} />
      </div>
      <Progress
        value={level.progress * 100}
        label={!level.atMax ? `До уровня ${level.number + 1}` : 'Все уровни пройдены'}
        showValue={!level.atMax}
        valueText={`ещё ${level.xpToNext} XP`}
      />
    </Card>
  );
}
