/** Подписи полей замеров из плана. Поле photo пока не поддерживается. */
export const MEASUREMENT_FIELDS: Record<string, { label: string; unit: string }> = {
  pushups_max: { label: 'Максимум отжиманий за подход', unit: 'раз' },
  pullups_max: { label: 'Максимум подтягиваний', unit: 'раз' },
  hang_sec: { label: 'Вис на турнике', unit: 'сек' },
  weight_kg: { label: 'Вес', unit: 'кг' },
  waist_cm: { label: 'Талия', unit: 'см' },
};
