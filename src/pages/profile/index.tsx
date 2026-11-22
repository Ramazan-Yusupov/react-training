import { MAX_PROFILE_LEVEL, profileRanks } from '@/entities/progress';
import { Card, Progress } from '@/shared/ui';
import { AccountAvatar } from '@/features/account/AccountAvatar';
import { ProfileAccount } from '@/features/account/ProfileAccount';
import { useXpSummary } from '@/widgets/xp-summary';

export default function ProfilePage() {
  const { xp, level, streak } = useXpSummary();
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <ProfileAccount>
        <Card>
          <div className="flex items-center gap-4">
            <AccountAvatar size="xl" />
            <div>
              <h2 className="text-xl font-semibold">{level.rank.title}</h2>
              <p>
                Уровень {level.number} из {MAX_PROFILE_LEVEL}
              </p>
            </div>
          </div>
          <Progress
            value={level.progress * 100}
            label={level.atMax ? 'Максимальный уровень' : `До уровня ${level.number + 1}`}
            showValue
            valueText={level.atMax ? '100%' : `${level.xpToNext} XP`}
          />
          <p className="text-sm text-gray-400">
            Всего {xp} XP · Серия дней: {streak}
          </p>
        </Card>
        <Card title="Звания">
          <ol className="divide-y divide-white/10">
            {profileRanks.map((rank) => (
              <li
                key={rank.level}
                aria-current={rank === level.rank ? 'step' : undefined}
                className="flex items-center justify-between gap-3 py-2 text-sm aria-[current=step]:font-semibold aria-[current=step]:text-blue-400"
              >
                <span>{rank.title}</span>
                <span>{rank.level} ур.</span>
              </li>
            ))}
          </ol>
        </Card>
      </ProfileAccount>
    </section>
  );
}
