import { DaySwitcher, useSelectedDay } from '@/features/select-day';
import { StartPlanBanner } from '@/features/start-plan';
import { DayBoard } from '@/widgets/day-board';
import { FocusTools } from '@/widgets/focus-tools';
import { MonthStrip } from '@/widgets/month-strip';
import { PostureToday } from '@/widgets/posture-today';
import { QuickSettings } from '@/widgets/quick-settings';
import { XpWeekChart } from '@/widgets/xp-week-chart';

export function TodayPage() {
  const { day, setDay } = useSelectedDay();

  return (
    <div className="flex flex-col gap-6">
      <StartPlanBanner />
      <DaySwitcher day={day} onChange={setDay} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <DayBoard day={day} />
          <PostureToday day={day} />
        </div>
        <div className="flex flex-col gap-6">
          <FocusTools day={day} />
          <MonthStrip selected={day} onSelect={setDay} />
          <XpWeekChart day={day} />
          <QuickSettings />
        </div>
      </div>
    </div>
  );
}
