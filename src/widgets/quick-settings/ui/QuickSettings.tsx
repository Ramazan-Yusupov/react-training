import { OptionalPostureSwitch } from '@/features/toggle-optional-posture';
import { WorkStartSelect } from '@/features/set-work-start';
import { Card } from '@/shared/ui';

export function QuickSettings() {
  return (
    <Card title="Быстрые настройки">
      <WorkStartSelect />
      <OptionalPostureSwitch />
    </Card>
  );
}
