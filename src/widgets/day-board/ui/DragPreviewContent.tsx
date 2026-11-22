import type { PlanContentOrderItem, PlanDay } from '@/entities/plan';

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { Card, Typography } from '@/shared/ui';

import { StandaloneTaskItem } from './StandaloneTaskItem';
import { TaskItem } from './TaskItem';

interface DragPreviewContentProps {
  item: PlanContentOrderItem;
  day: number;
  planDay: PlanDay;
}

export function DragPreviewContent({ item, day, planDay }: DragPreviewContentProps) {
  if (item.type === 'group') {
    const group = planDay.groups.find((current) => current.id === item.id);

    if (!group) return null;

    const tasks = planDay.tasks.filter((task) => task.groupId === group.id);

    return (
      <section className="flex h-full min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-3 pl-10">
        <Typography className="min-w-0 truncate" as="h6" align="start" tone="accent" text={group.title} />

        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} day={day} />
        ))}
      </section>
    );
  }

  if (item.type === 'task') {
    const task = planDay.tasks.find((current) => current.id === item.id);

    if (!task) return null;

    return (
      <div className="h-full min-w-0 rounded-2xl bg-slate-950">
        <StandaloneTaskItem task={task} day={day} />
      </div>
    );
  }

  const widget = planDay.widgets.find((current) => current.id === item.id);

  if (!widget) return null;

  if (widget.type === 'micro-breaks') {
    return <MicroBreaks day={day} onSettingsClick={() => {}} />;
  }

  if (widget.type === 'xp-by-days') {
    return <XpWeekChart day={day} onSettingsClick={() => {}} />;
  }

  return (
    <Card classNameMain="border-2 border-dotted border-amber-600 rounded-2xl p-4 pl-10">
      <Typography className="min-w-0 truncate" as="h6" align="start" tone="accent" text="Заметки дня" />

      <div className="mt-3">
        {widget.notes.trim() ? (
          <p className="whitespace-pre-wrap wrap-anywhere text-sm text-slate-300">
            {widget.notes}
          </p>
        ) : (
          <Typography align="start" tone="muted">
            Пока нет заметок.
          </Typography>
        )}
      </div>
    </Card>
  );
}
