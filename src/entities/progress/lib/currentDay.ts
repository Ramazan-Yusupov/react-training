import { clamp, diffDays } from '@/shared/lib';

export interface CurrentDay {
  /** Номер дня плана, ограниченный диапазоном 1..length */
  day: number;
  /** План ещё не начался */
  isBeforeStart: boolean;
  /** План уже закончился */
  isAfterEnd: boolean;
}

export function getCurrentDay(startDate: string, todayIso: string, length: number): CurrentDay {
  const raw = diffDays(startDate, todayIso) + 1;
  return { day: clamp(raw, 1, length), isBeforeStart: raw < 1, isAfterEnd: raw > length };
}
