import { workoutPlan } from '@/entities/plan';
import { Card, Badge, Typography, Progress } from '@/shared/ui';

interface PlanWeekSummaryProps {
  day: number;
}

export function PlanWeekSummary({ day }: PlanWeekSummaryProps) {
  const selectedDay = workoutPlan.days.find((item) => item.day === day);
  const week = workoutPlan.weeks.find((item) => item.week === selectedDay?.week);
  const daysInWeek = workoutPlan.days.filter((item) => item.week === selectedDay?.week);
  const weekProgress = daysInWeek.length ? (daysInWeek.filter((item) => item.day < day).length / daysInWeek.length) * 100 : 0;

  if (!week || !selectedDay) return null;

  return (
    <Card title={`Неделя ${week.week}`} headerRight={<Badge color="blue" text={selectedDay.kind === 'rest' ? 'Восстановление' : (week.title.split('—')[0] ?? week.title).trim()} />}>
      <Typography as="h5" align="start">{week.title}</Typography>
      <Typography align="start" tone="muted">{week.goal}</Typography>
      {week.peakReps !== null && week.peakReps !== undefined && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
          <Typography align="start" tone="muted">Плановый пик отжиманий</Typography>
          <Typography as="h4" tone="accent">{week.peakReps}</Typography>
        </div>
      )}
      <Progress value={weekProgress} label="Дни недели до выбранного" showValue />
      <Typography as="span" align="start" tone="muted">
        {daysInWeek.length} дней в этой неделе · день {daysInWeek[0]?.day}–{daysInWeek.at(-1)?.day}
      </Typography>
    </Card>
  );
}
