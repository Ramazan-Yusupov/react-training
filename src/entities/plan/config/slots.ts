import type { Slot } from '../model/types';

export const SLOT_ORDER: Slot[] = ['morning', 'workday', 'midday', 'afternoon', 'evening', 'night'];

export const SLOT_LABELS: Record<Slot, string> = {
  morning: 'Утро',
  workday: 'В течение дня',
  midday: 'Обед',
  afternoon: 'Днём, около 16:00',
  evening: 'Вечер',
  night: 'Конец работы',
};

export const DAY_KIND_LABELS = {
  progress: 'Рост',
  light: 'Лёгкий день',
  rest: 'Отдых',
  test: 'Тест',
} as const;
