import { usePlanStore } from '@/entities/plan';
import { getCurrentDay, useProgressStore } from '@/entities/progress';
import { clamp, todayISO } from '@/shared/lib';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Выбранный день плана хранится в адресе (?day=5). */
export function useSelectedDay() {
  const [params, setParams] = useSearchParams();

  const startDate = useProgressStore((state) => state.startDate);
  const totalDays = usePlanStore((state) => state.template.days.length);

  const current = getCurrentDay(startDate, todayISO(), totalDays);

  const fromUrl = Number(params.get('day'));

  const day =
    Number.isInteger(fromUrl) && fromUrl >= 1 ? clamp(fromUrl, 1, totalDays) : current.day;

  const setDay = useCallback(
    (next: number) => {
      const safe = clamp(next, 1, totalDays);

      setParams(safe === current.day ? {} : { day: String(safe) }, { replace: true });
    },
    [current.day, setParams, totalDays],
  );

  return { day, setDay, currentDay: current.day };
}
