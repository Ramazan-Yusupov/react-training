import { Badge, Card, Typography } from '@/shared/ui';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <Card headerRight={<Badge color="yellow" text="В разработке" />} title={title}>
      <Typography as="p" align="start" tone="muted" text={description} />
    </Card>
  );
}
