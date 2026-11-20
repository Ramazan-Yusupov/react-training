import { getCurrentDay, useProgressStore } from '@/entities/progress';
import { PLAN_LENGTH_DAYS } from '@/shared/config';
import { clamp, todayISO } from '@/shared/lib';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Выбранный день плана хранится в адресе (?day=5), поэтому на него можно сделать ссылку. */
export function useSelectedDay() {
  const [params, setParams] = useSearchParams();
  const startDate = useProgressStore((state) => state.startDate);

  const current = getCurrentDay(startDate, todayISO(), PLAN_LENGTH_DAYS);
  const fromUrl = Number(params.get('day'));
  const day =
    Number.isInteger(fromUrl) && fromUrl >= 1 ? clamp(fromUrl, 1, PLAN_LENGTH_DAYS) : current.day;

  const setDay = useCallback(
    (next: number) => {
      const safe = clamp(next, 1, PLAN_LENGTH_DAYS);
      setParams(safe === current.day ? {} : { day: String(safe) }, { replace: true });
    },
    [current.day, setParams],
  );

  return { day, setDay, currentDay: current.day };
}
