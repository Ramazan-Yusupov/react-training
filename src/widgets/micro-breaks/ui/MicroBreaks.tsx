import { MicroBreakCounter } from '@/features/micro-breaks';
import { DiceRoller } from '@/features/roll-dice';

interface MicroBreaksProps {
  day: number;
}

/** Самостоятельный виджет учёта и выполнения микро-пауз. */
export function MicroBreaks({ day }: MicroBreaksProps) {
  return (
    <div className="flex flex-col gap-5">
      <MicroBreakCounter day={day} />

      <div className="rounded-xl border border-white/10 p-4">
        <DiceRoller day={day} />
      </div>
    </div>
  );
}
