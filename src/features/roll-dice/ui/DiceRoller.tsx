import { xpConfig } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Button, Typography, toast } from '@/shared/ui';
import { useState } from 'react';
import { FaCheck, FaDiceD6 } from 'react-icons/fa6';

interface DiceRollerProps {
  day: number;
  /** Очки за одну микро-паузу */
  xpPerBreak?: number;
}

const microBreakOptions = [
  { face: 1, text: 'Встань и немного пройдись.' },
  { face: 2, text: 'Переведи взгляд вдаль и отдохни от экрана.' },
  { face: 3, text: 'Расслабь плечи и измени положение тела.' },
  { face: 4, text: 'Сделай несколько спокойных глубоких вдохов.' },
  { face: 5, text: 'Выпей воды и немного отдохни.' },
  { face: 6, text: 'Отведи взгляд от экрана и дай глазам отдохнуть.' },
];

/** Кубик: случайная идея для микро-паузы. */
export function DiceRoller({ day, xpPerBreak = 2 }: DiceRollerProps) {
  const [face, setFace] = useState<number | null>(null);

  const count = useProgressStore((state) => state.microBreaks[day] ?? 0);

  const setMicroBreaks = useProgressStore((state) => state.setMicroBreaks);

  const result = microBreakOptions.find((item) => item.face === face);

  const roll = () => {
    const picked = microBreakOptions[Math.floor(Math.random() * microBreakOptions.length)];

    if (picked) {
      setFace(picked.face);
    }
  };

  const done = () => {
    setMicroBreaks(day, count + 1);

    toast.success(
      count < xpConfig.microBreakCap
        ? `+${xpPerBreak} XP: микро-пауза`
        : 'Лимит очков за паузы на сегодня достигнут',
    );

    setFace(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="primary" icon={<FaDiceD6 />} title="Бросить кубик" onClick={roll} />

      {result ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 p-4">
          <Typography as="h3" tone="accent" text={String(result.face)} />

          <Typography as="p" text={result.text} />

          <Button size="sm" icon={<FaCheck />} title="Сделал" onClick={done} />
        </div>
      ) : (
        <Typography as="p" tone="muted" text="Брось кубик и выполни небольшую микро-паузу." />
      )}
    </div>
  );
}
