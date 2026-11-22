import type { PlanGroup, PlanTask } from '@/entities/plan';

import { GroupEditor } from './GroupEditor';
import { TaskEditor } from './TaskEditor';
import { TaskItem } from './TaskItem';

interface GroupContentItemProps {
  day: number;
  group: PlanGroup;
  tasks: PlanTask[];
}

export function GroupContentItem({ day, group, tasks }: GroupContentItemProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-800 p-3 pl-10">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-medium text-slate-200" title={group.title}>
          {group.title}
        </h3>

        <div className="flex shrink-0 items-center gap-1">
          <GroupEditor day={day} group={group} />
        </div>
      </div>

      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} day={day} />
      ))}

      <TaskEditor day={day} groupId={group.id} />
    </section>
  );
}
