import { useRef } from 'react';
import type { PlanTask } from '@/entities/plan';
import { TaskFocusContext } from '@/features/focus-timer';
import { useSelectedDay } from '@/features/select-day';
import { DayBoard } from '@/widgets/day-board';
import { FocusTools } from '@/widgets/focus-tools';
import { MonthStrip } from '@/widgets/month-strip';

export function TodayPage() {
  const { day, setDay } = useSelectedDay();
  const startTask = useRef<((day: number, task: PlanTask) => void) | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:h-[calc(100dvh-9rem)] xl:min-h-0 xl:overflow-hidden">
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] xl:overflow-hidden">
        <section className="flex min-w-0 flex-col xl:min-h-0 xl:overflow-hidden">
          <TaskFocusContext.Provider value={(day, task) => startTask.current?.(day, task)}>
            <DayBoard day={day} onDayChange={setDay} />
          </TaskFocusContext.Provider>
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:min-h-0 xl:overflow-hidden">
          <FocusTools startTaskRef={startTask} />
          <MonthStrip selected={day} onSelect={setDay} />
        </aside>
      </div>
    </div>
  );
}
