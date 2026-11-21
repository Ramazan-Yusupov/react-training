/** Ключи localStorage. Версия в имени нужна для будущих миграций. */
export const STORAGE_KEYS = {
  PROGRESS: 'planer-progress-v1',
  SETTINGS: 'planer-settings-v1',
} as const;

/** Режим таймера 50/10 (в секундах). */
export const FOCUS_TIMER = {
  WORK: 50 * 60,
  BREAK: 10 * 60,
} as const;
