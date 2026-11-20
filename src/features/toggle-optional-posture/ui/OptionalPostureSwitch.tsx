import { useSettingsStore } from '@/entities/settings';
import { Switch } from '@/shared/ui';

export function OptionalPostureSwitch() {
  const checked = useSettingsStore((state) => state.showOptionalPosture);
  const setShowOptionalPosture = useSettingsStore((state) => state.setShowOptionalPosture);

  return (
    <Switch
      checked={checked}
      onChange={(event) => setShowOptionalPosture(event.target.checked)}
      label="Дополнительные блоки осанки"
      description="Блоки корсета 2–4 и часовая тренировка из исходного плана"
    />
  );
}
