import { useProgressStore } from '@/entities/progress';
import { Input } from '@/shared/ui';

interface CorsetLogProps {
  postureDay: number;
  plannedMinutes: number;
}

/** Сколько минут корсет реально был надет в этот день. */
export function CorsetLog({ postureDay, plannedMinutes }: CorsetLogProps) {
  const minutes = useProgressStore((state) => state.corsetMinutes[postureDay]);
  const setCorsetMinutes = useProgressStore((state) => state.setCorsetMinutes);

  return (
    <Input
      type="number"
      min={0}
      max={600}
      inputMode="numeric"
      label="Сколько минут носил корсет"
      hint={`По плану: ${plannedMinutes} мин. Не носи дольше 1,5–2 часов подряд.`}
      value={minutes === undefined ? '' : String(minutes)}
      onChange={(event) => setCorsetMinutes(postureDay, Number(event.target.value))}
    />
  );
}
