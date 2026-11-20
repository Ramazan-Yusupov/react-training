import { DaySwitcher, useSelectedDay } from '@/features/select-day';
import { DayBoard } from '@/widgets/day-board';
import { FocusTools } from '@/widgets/focus-tools';
import { MonthStrip } from '@/widgets/month-strip';
import { QuickSettings } from '@/widgets/quick-settings';
import { XpWeekChart } from '@/widgets/xp-week-chart';

export function TodayPage() {
  const { day, setDay } = useSelectedDay();

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex w-full justify-center">
        <DaySwitcher day={day} onChange={setDay} className="w-full sm:w-auto" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <section className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <DayBoard day={day} />
        </section>

        <aside className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <FocusTools day={day} />

          <MonthStrip selected={day} onSelect={setDay} />

          <XpWeekChart day={day} />
        </aside>
      </div>
    </div>
  );
}
