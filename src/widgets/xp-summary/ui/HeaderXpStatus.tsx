import { NavLink } from 'react-router-dom';
import { PAGES } from '@/shared/config';
import { Progress } from '@/shared/ui';
import { AccountAvatar } from '@/features/account/AccountAvatar';
import { useXpSummary } from '../model/useXpSummary';

export function HeaderXpStatus() {
  const { xp, level } = useXpSummary();
  const xpLabel = level.atMax ? `${xp} XP` : `${level.levelXp}/${level.xpPerLevel} XP`;
  return (
    <NavLink
      to={PAGES.PROFILE}
      aria-label={`Профиль, ${level.number} уровень, ${level.rank.title}, ${xpLabel}`}
      className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1 text-sm hover:bg-white/10 focus-visible:outline-blue-400"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-gray-400">{level.rank.title}</span>
          <span className="shrink-0 font-semibold">{level.number} ур.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Progress
            className="min-w-8 flex-1"
            size="sm"
            value={level.levelXp}
            max={level.xpPerLevel}
          />
          <span className="shrink-0 text-[10px] leading-none text-gray-400">{xpLabel}</span>
        </div>
      </div>
      <AccountAvatar size="sm" />
    </NavLink>
  );
}
