import { posturePlan } from '@/entities/plan';
import { getCurrentDay, useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { DaySwitcher } from '@/features/select-day';
import { OptionalPostureSwitch } from '@/features/toggle-optional-posture';
import { WorkStartSelect } from '@/features/set-work-start';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { addDays, todayISO } from '@/shared/lib';
import { Button, Card, Typography, toast } from '@/shared/ui';
import { useState } from 'react';
import { PostureCalendar } from './PostureCalendar';
import { PostureDayDetails } from './PostureDayDetails';
import { PosturePostTest } from './PosturePostTest';
import { PostureSafety } from './PostureSafety';
import { PostureWeekSummary } from './PostureWeekSummary';

export function PosturePage() {
  const postureStartDate = useProgressStore((state) => state.postureStartDate);
  const startPostureToday = useProgressStore((state) => state.startPostureToday);
  const workStartHour = useSettingsStore((state) => state.workStartHour);
  const [selectedDay, setSelectedDay] = useState(() =>
    postureStartDate ? getCurrentDay(postureStartDate, todayISO(), PLAN_LENGTH_DAYS).day : 1,
  );

  const startDate = postureStartDate ?? todayISO();
  const current = postureStartDate
    ? getCurrentDay(postureStartDate, todayISO(), PLAN_LENGTH_DAYS)
    : undefined;
  const dayDate = addDays(startDate, selectedDay - 1);

  const handleStart = () => {
    startPostureToday();
    setSelectedDay(1);
    toast.success('План осанки начат: сегодня день 1');
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography as="h2" align="start">
            План осанки
          </Typography>
          <Typography align="start" tone="muted">
            30 дней · корсет · упражнения · восстановление
          </Typography>
        </div>
        <Typography as="span" tone="muted">
          Отдельный план · 30 дней
        </Typography>
      </header>

      {!postureStartDate && (
        <Card
          border="2px"
          borderColor="rgb(59 130 246 / 0.5)"
          footer={<Button variant="primary" title="Начать план сегодня" onClick={handleStart} />}
        >
          <Typography align="start">
            План осанки ещё не начат. Можно начать сегодня — тогда сегодня будет день 1.
          </Typography>
          <Typography align="start" tone="muted" className="text-sm">
            План ведётся независимо от тренировок. Дата начала сохранится отдельно.
          </Typography>
        </Card>
      )}
      {current?.isAfterEnd && (
        <Card>
          <Typography align="start" tone="success">
            Все 30 дней плана осанки завершены. История выполнения и замеры сохранены.
          </Typography>
        </Card>
      )}

      <DaySwitcher day={selectedDay} onChange={setSelectedDay} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <section className="flex min-w-0 flex-col gap-5">
          <PostureDayDetails day={selectedDay} date={dayDate} />
          <PostureSafety />
          <PosturePostTest day={selectedDay} />
        </section>
        <aside className="flex min-w-0 flex-col gap-5">
          <PostureCalendar
            startDate={startDate}
            selected={selectedDay}
            currentDay={
              current && !current.isBeforeStart && !current.isAfterEnd ? current.day : undefined
            }
            onSelect={setSelectedDay}
          />
          <PostureWeekSummary day={selectedDay} />
          <Card title="Быстрые настройки">
            <WorkStartSelect />
            <OptionalPostureSwitch />
            <Typography align="start" tone="muted" className="text-xs">
              Начало работы: {String(workStartHour).padStart(2, '0')}:00. Время гибкого утреннего
              блока рассчитывается от этого значения.
            </Typography>
          </Card>
          <Card title="После 30 дней">
            <div className="flex flex-col gap-3">
              {posturePlan.afterMonth.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <Typography align="start" className="font-semibold">
                    {item.title}
                  </Typography>
                  <Typography align="start" tone="muted" className="text-sm">
                    {item.text}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
