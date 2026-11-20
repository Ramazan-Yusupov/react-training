import { useSettingsStore } from '@/entities/settings';
import { Select } from '@/shared/ui';

const OPTIONS = [6, 7, 8, 9, 10].map((hour) => ({
  value: hour,
  label: `${String(hour).padStart(2, '0')}:00`,
}));

/** Во сколько садишься за ПК: от этого считается время утреннего корсета. */
export function WorkStartSelect() {
  const hour = useSettingsStore((state) => state.workStartHour);
  const setWorkStartHour = useSettingsStore((state) => state.setWorkStartHour);

  return (
    <Select
      label="Начало работы за ПК"
      hint="Утренний блок корсета начнётся через час после этого времени"
      value={hour}
      options={OPTIONS}
      onChange={(event) => setWorkStartHour(Number(event.target.value))}
    />
  );
}
