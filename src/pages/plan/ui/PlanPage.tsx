import { workoutPlan } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { DaySwitcher, useSelectedDay } from '@/features/select-day';
import { StartPlanBanner } from '@/features/start-plan';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { Card, Typography } from '@/shared/ui';
import { DayBoard } from '@/widgets/day-board';
import { PlanCalendar } from './PlanCalendar';
import { PlanWeekSummary } from './PlanWeekSummary';

export function PlanPage() {
  const { day, setDay } = useSelectedDay();

  const completed = useProgressStore((state) => state.completed);

  const completedDays = workoutPlan.days.filter((item) => {
    const required = item.tasks.filter((task) => task.required);

    return required.length > 0 && required.every((task) => Boolean(completed[task.id]));
  }).length;

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <header className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography as="h2" align="start">
            План тренировок
          </Typography>

          <Typography align="start" tone="muted">
            30 дней · отжимания · турник · активные паузы
          </Typography>
        </div>

        <Typography as="span" tone="muted" className="text-sm">
          {completedDays} / {PLAN_LENGTH_DAYS} дней завершено
        </Typography>
      </header>

      <StartPlanBanner />

      <div className="flex w-full justify-center">
        <DaySwitcher day={day} onChange={setDay} className="w-full sm:w-auto" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <section className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <DayBoard day={day} />
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6">
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
