import { workoutPlan } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { DaySwitcher, useSelectedDay } from '@/features/select-day';
import { StartPlanBanner } from '@/features/start-plan';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { PlanCalendar } from './PlanCalendar';
import { PlanWeekSummary } from './PlanWeekSummary';
import { DayBoard } from '@/widgets/day-board';
import { Card, Typography } from '@/shared/ui';

export function PlanPage() {
  const { day, setDay } = useSelectedDay();

  const completed = useProgressStore((state) => state.completed);
  const completedDays = workoutPlan.days.filter((item) => {
    const required = item.tasks.filter((task) => task.required);
    return required.length > 0 && required.every((task) => Boolean(completed[task.id]));
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography as="h2" align="start">
            План тренировок
          </Typography>
          <Typography align="start" tone="muted">
            30 дней · отжимания · турник · активные паузы
          </Typography>
        </div>
        <Typography as="span" tone="muted">
          {completedDays} / {PLAN_LENGTH_DAYS} дней завершено
        </Typography>
      </div>
      <StartPlanBanner />
      <DaySwitcher day={day} onChange={setDay} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <DayBoard day={day} />
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <PlanCalendar selected={day} onSelect={setDay} />
          <PlanWeekSummary day={day} />
          <Card title="О программе">
            <Typography align="start">{workoutPlan.title}</Typography>
            <Typography align="start" tone="muted">
              {workoutPlan.description}
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Typography as="span" tone="muted">
                Всего запланировано отжиманий:
              </Typography>
              <Typography as="span">
                {workoutPlan.totals.pushupRepsPlanned.toLocaleString('ru-RU')}
              </Typography>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
