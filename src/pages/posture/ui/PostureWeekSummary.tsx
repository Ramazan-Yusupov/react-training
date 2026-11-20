import { posturePlan } from '@/entities/plan';
import { Badge, Card, Progress, Typography } from '@/shared/ui';

interface PostureWeekSummaryProps {
  day: number;
}

export function PostureWeekSummary({ day }: PostureWeekSummaryProps) {
  const selectedDay = posturePlan.days.find((item) => item.day === day);
  const week = posturePlan.weeks.find((item) => item.week === selectedDay?.week);
  const weekDays = posturePlan.days.filter((item) => item.week === selectedDay?.week);
  if (!selectedDay || !week) return null;

  const passedDays = weekDays.filter((item) => item.day < day).length;
  const progress = weekDays.length ? (passedDays / weekDays.length) * 100 : 0;

  return (
    <Card title={`Неделя ${week.week}`} headerRight={<Badge color="blue" text={selectedDay.corsetOff ? 'Восстановление' : 'По плану'} />}>
      <Typography as="h5" align="start">{week.title}</Typography>
      <Typography align="start" tone="muted">{week.goal}</Typography>
      <div className="rounded-lg border border-white/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <Typography align="start" tone="muted">Утренний блок корсета</Typography>
          <Typography as="h4" tone="accent">{selectedDay.totalMinutesMorningOnly} мин</Typography>
        </div>
        <Typography align="start" tone="muted" className="text-xs">Запланированная продолжительность выбранного дня</Typography>
      </div>
      <Progress value={progress} label="Дни недели до выбранного" showValue />
      <Typography as="span" align="start" tone="muted">
        {weekDays.length} дней · день {weekDays[0]?.day}–{weekDays.at(-1)?.day}
      </Typography>
    </Card>
  );
}
