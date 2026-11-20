import { posturePlan } from '@/entities/plan';
import { Accordion, Card, Typography } from '@/shared/ui';

export function PostureSafety() {
  return (
    <Card title="Правила и безопасность">
      <Typography align="start" tone="muted">
        Ориентируйся на самочувствие. Не используй корсет через боль или дискомфорт; при неприятных симптомах сними его и оцени ситуацию.
      </Typography>
      <Accordion items={[
        {
          id: 'red-flags',
          title: 'Когда снять корсет',
          content: <ul className="flex list-disc flex-col gap-1 pl-5">{posturePlan.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>,
        },
        {
          id: 'lifehack',
          title: 'Паузы и активность в течение дня',
          content: (
            <div className="flex flex-col gap-2">
              <Typography align="start">Каждые {posturePlan.breakLifehack.everyMinutes}</Typography>
              <ul className="flex list-disc flex-col gap-1 pl-5">{posturePlan.breakLifehack.actions.map((action) => <li key={action}>{action}</li>)}</ul>
            </div>
          ),
        },
      ]} />
    </Card>
  );
}
