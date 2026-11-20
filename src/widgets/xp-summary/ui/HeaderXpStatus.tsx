import { useState } from 'react';
import { FaFire, FaLock, FaTrophy } from 'react-icons/fa6';
import { useXpSummary } from '../model/useXpSummary';

const TROPHY_COLORS: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  boss: 'text-violet-400',
};

export function HeaderXpStatus() {
  const { xp, level, streak, reachedLevels, levels } = useXpSummary();
  const [isOpen, setIsOpen] = useState(false);
  const currentTitle = level.current?.title ?? 'Новичок';
  const currentTrophyColor = level.current
    ? (TROPHY_COLORS[level.current.id] ?? 'text-blue-400')
    : 'text-gray-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-32 min-w-0 flex-col gap-1 sm:w-44">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="truncate font-semibold text-white">{currentTitle}</span>
          <span className="whitespace-nowrap text-gray-400">
            {level.next ? `ещё ${level.xpToNext} XP` : `${xp} XP`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Прогресс до следующего уровня"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(level.progress * 100)}
          className="h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
            style={{ width: `${level.progress * 100}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Кубки и достижения"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="relative flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-amber-400 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <FaTrophy className={`text-lg ${currentTrophyColor}`} />
          {reachedLevels > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {reachedLevels}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-white/15 bg-neutral-950 p-3 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-white">Кубки и уровни</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть"
                className="rounded-md px-2 py-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {levels.map((item) => {
                const unlocked = item.xp !== null && xp >= item.xp;
                const isCurrent = item.id === level.current?.id;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ${
                        unlocked ? TROPHY_COLORS[item.id] ?? 'text-blue-400' : 'text-gray-600'
                      }`}
                    >
                      {unlocked ? <FaTrophy /> : <FaLock />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-white">{item.title}</span>
                        {isCurrent && <span className="text-[10px] text-blue-400">Текущий</span>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.xp !== null
                          ? `${item.xp} XP`
                          : `Откроется на ${item.unlockDay}-м дне`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-gray-400">
              <FaFire className="text-orange-400" />
              Серия: {streak} {streak === 1 ? 'день' : 'дней'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
