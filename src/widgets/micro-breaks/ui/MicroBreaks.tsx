import { MicroBreakCounter } from '@/features/micro-breaks';
import { DiceRoller } from '@/features/roll-dice';

interface MicroBreaksProps {
  day: number;
  onSettingsClick: () => void;
}

/** Самостоятельный виджет учёта и выполнения микро-пауз. */
export function MicroBreaks({ day, onSettingsClick }: MicroBreaksProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border-2 border-dotted border-amber-600 p-4 pl-10">
      <MicroBreakCounter day={day} onSettingsClick={onSettingsClick} />

      <div className="rounded-xl border border-white/10 p-4">
        <DiceRoller day={day} />
      </div>
    </div>
  );
}
