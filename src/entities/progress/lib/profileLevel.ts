export const MAX_PROFILE_LEVEL = 1000;
const XP_PER_LEVEL = 100;

export const profileRanks = [
  { level: 1, title: 'Новичок' },
  { level: 5, title: 'Практик' },
  { level: 10, title: 'Опытный' },
  { level: 25, title: 'Знаток' },
  { level: 50, title: 'Специалист' },
  { level: 100, title: 'Эксперт' },
  { level: 200, title: 'Мастер' },
  { level: 350, title: 'Наставник' },
  { level: 500, title: 'Стратег' },
  { level: 750, title: 'Гроссмейстер' },
  { level: MAX_PROFILE_LEVEL, title: 'Легенда' },
] as const;

export function getProfileLevel(totalXp: number) {
  const xp = Math.max(0, Math.floor(totalXp));
  const number = Math.min(MAX_PROFILE_LEVEL, 1 + Math.floor(xp / XP_PER_LEVEL));
  const rank = profileRanks.reduce(
    (current, rank) => (rank.level <= number ? rank : current),
    profileRanks[0] as (typeof profileRanks)[number],
  );
  const atMax = number === MAX_PROFILE_LEVEL;
  const xpToNext = atMax ? 0 : XP_PER_LEVEL - (xp % XP_PER_LEVEL);
  return {
    number,
    rank,
    xpToNext,
    levelXp: XP_PER_LEVEL - xpToNext,
    xpPerLevel: XP_PER_LEVEL,
    progress: 1 - xpToNext / XP_PER_LEVEL,
    atMax,
  };
}
