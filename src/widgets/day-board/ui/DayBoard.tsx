import { usePlanStore } from '@/entities/plan';
import type { PlanWidgetType } from '@/entities/plan';

import { useProgressStore } from '@/entities/progress';

import { ErrorUI } from '@/shared/ui';

import { DayBoardView } from './DayBoardView';

import type { EditScope } from '@/entities/plan';

interface DayBoardProps {
  day: number;
  onDayChange: (day: number) => void;
}

export function DayBoard({ day, onDayChange }: DayBoardProps) {
  const startDate = useProgressStore((state) => state.startDate);

  const template = usePlanStore((state) => state.template);
  const dayOverride = usePlanStore((state) => state.dayOverrides[String(day)]);
  const addWidget = usePlanStore((state) => state.addWidget);

  const planDay = dayOverride ?? template.days.find((item) => item.day === day);

  if (!planDay) {
    return <ErrorUI isError text={`Для дня ${day} нет данных`} />;
  }

  const handleAddWidget = (type: PlanWidgetType, scope: EditScope) => addWidget(day, type, scope);

  return (
    <DayBoardView
      day={day}
      planDay={planDay}
      startDate={startDate}
      totalDays={template.days.length}
      onDayChange={onDayChange}
      onAddWidget={handleAddWidget}
    />
  );
}
