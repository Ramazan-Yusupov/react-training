import { useSelectedDay } from '@/features/select-day';
import { DayBoard } from '@/widgets/day-board';
import { FocusTools } from '@/widgets/focus-tools';
import { MonthStrip } from '@/widgets/month-strip';

export function TodayPage() {
  const { day, setDay } = useSelectedDay();

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-0 flex-col gap-4 overflow-hidden sm:gap-6">
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden sm:gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <DayBoard day={day} onDayChange={setDay} />
        </section>

        <aside className="hidden min-h-0 min-w-0 flex-col gap-4 overflow-hidden sm:gap-6 lg:flex">
          <FocusTools />
          <MonthStrip selected={day} onSelect={setDay} />
        </aside>
      </div>
    </div>
  );
}
