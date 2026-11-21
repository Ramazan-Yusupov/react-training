import { useMicroBreakStore, type MicroBreak } from '@/entities/micro-breaks';
import { xpConfig } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Button, Typography, toast } from '@/shared/ui';
import { useMemo, useState } from 'react';
import { FaCheck, FaDiceD6 } from 'react-icons/fa6';

interface DiceRollerProps {
  day: number;
  /** Очки за одну микро-паузу */
  xpPerBreak?: number;
}

/** Кубик: случайно выбирает одну из включённых пользовательских микро-пауз. */
export function DiceRoller({ day, xpPerBreak = xpConfig.microBreakXp }: DiceRollerProps) {
  const [selectedBreakId, setSelectedBreakId] = useState<string | null>(null);

  const items = useMicroBreakStore((state) => state.items);

  const enabledItems = useMemo(
    () => items.filter((item) => item.enabled).sort((a, b) => a.order - b.order),
    [items],
  );

  const count = useProgressStore((state) => state.microBreaks[day] ?? 0);
  const setMicroBreaks = useProgressStore((state) => state.setMicroBreaks);

  const result: MicroBreak | undefined = enabledItems.find((item) => item.id === selectedBreakId);

  const roll = () => {
    if (enabledItems.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * enabledItems.length);
    const picked = enabledItems[randomIndex];

    if (picked) {
      setSelectedBreakId(picked.id);
    }
  };

  const done = () => {
    if (!result) {
      return;
    }

    setMicroBreaks(day, count + 1);

    toast.success(
      count < xpConfig.microBreakCap
        ? `+${xpPerBreak} XP: микро-пауза`
        : 'Лимит очков за паузы на сегодня достигнут',
    );

    setSelectedBreakId(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant="primary"
        icon={<FaDiceD6 />}
        title="Бросить кубик"
        onClick={roll}
        disabled={enabledItems.length === 0}
      />

      {result ? (
        <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-white/10 p-4">
          <Typography as="h3" tone="accent">
            {result.durationMinutes} мин.
          </Typography>

          <Typography as="p" align="center">
            {result.text}
          </Typography>

          <Button size="sm" icon={<FaCheck />} title="Сделал" onClick={done} />
        </div>
      ) : enabledItems.length === 0 ? (
        <Typography as="p" tone="muted" align="center">
          Нет включённых микро-пауз. Добавь или включи варианты в настройках.
        </Typography>
      ) : (
        <Typography as="p" tone="muted" align="center">
          Брось кубик и выполни небольшую микро-паузу.
        </Typography>
      )}
    </div>
  );
}
