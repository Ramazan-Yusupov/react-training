import { usePlanStore } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useCallback } from 'react';

interface UsePlanDayActionsProps {
  day: number;
  onChange: (day: number) => void;
}

export function usePlanDayActions({ day, onChange }: UsePlanDayActionsProps) {
  const addDay = usePlanStore((state) => state.addDay);
  const removeLastDay = usePlanStore((state) => state.removeLastDay);
  const clearMicroBreaks = useProgressStore((state) => state.clearMicroBreaks);

  const handleAddDay = useCallback(() => {
    const totalDays = usePlanStore.getState().template.days.length;

    addDay();
    onChange(totalDays + 1);
  }, [addDay, onChange]);

  const handleRemoveLastDay = useCallback(() => {
    const currentDays = usePlanStore.getState().template.days;

    if (currentDays.length <= 1) return;

    const lastDay = Math.max(...currentDays.map((item) => item.day));

    removeLastDay();

    const nextDays = usePlanStore.getState().template.days;

    // Очищаем прогресс только если день действительно удалён.
    if (nextDays.length < currentDays.length) {
      clearMicroBreaks(lastDay);
      onChange(Math.min(day, nextDays.length));
    }
  }, [clearMicroBreaks, day, onChange, removeLastDay]);

  return {
    handleAddDay,
    handleRemoveLastDay,
  };
}
