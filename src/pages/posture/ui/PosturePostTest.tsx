import { posturePlan } from '@/entities/plan';
import { Card } from '@/shared/ui';

interface PosturePostTestProps {
  day: number;
}

export function PosturePostTest({ day }: PosturePostTestProps) {
  if (day !== posturePlan.postTest.day) return null;

  return (
    <Card title={`Итоговый тест · день ${posturePlan.postTest.day}`}>
      <ul className="flex list-disc flex-col gap-2 pl-5">
        {posturePlan.postTest.steps.map((step) => <li key={step}>{step}</li>)}
      </ul>
    </Card>
  );
}
