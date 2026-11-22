import { useSelectedDay } from '@/features/select-day';
import { DayBoard } from '@/widgets/day-board';
import { FocusTools } from '@/widgets/focus-tools';
import { MonthStrip } from '@/widgets/month-strip';

export function TodayPage() {
  const { day, setDay } = useSelectedDay();

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:h-[calc(100dvh-9rem)] xl:min-h-0 xl:overflow-hidden">
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] xl:overflow-hidden">
        <section className="flex min-w-0 flex-col xl:min-h-0 xl:overflow-hidden">
          <DayBoard day={day} onDayChange={setDay} />
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:min-h-0 xl:overflow-hidden">
          <FocusTools />
          <MonthStrip selected={day} onSelect={setDay} />
        </aside>
      </div>
    </div>
  );
}
