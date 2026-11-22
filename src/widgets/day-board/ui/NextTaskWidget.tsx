import { useContext, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { usePlanStore } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { TaskFocusContext } from '@/features/focus-timer';
import { addDays, todayISO } from '@/shared/lib/date';
import { formatTaskDuration } from '@/shared/lib/format';
import { Button, IconButton } from '@/shared/ui';

export function NextTaskWidget({
  day,
  onDeleteClick,
}: {
  day: number;
  onDeleteClick?: () => void;
}) {
  const planDay = usePlanStore(
    (s) => s.dayOverrides[String(day)] ?? s.template.days.find((d) => d.day === day),
  );
  const completed = useProgressStore((s) => s.completed);
  const startDate = useProgressStore((s) => s.startDate);
  const startFocus = useContext(TaskFocusContext);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const pending = (planDay?.tasks ?? []).filter((task) => !completed[task.id]);
  const scheduled = pending
    .filter((task) => task.scheduledTime)
    .sort((a, b) => a.scheduledTime!.localeCompare(b.scheduledTime!));
  const currentTime =
    addDays(startDate, day - 1) === todayISO() ? now.toTimeString().slice(0, 5) : '00:00';
  const next =
    scheduled.find((task) => task.scheduledTime! >= currentTime) ?? scheduled[0] ?? pending[0];

  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-2xl border-2 border-dotted border-amber-600 p-4 pl-10">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-medium text-blue-400">Следующая задача</h3>
        {onDeleteClick && (
          <IconButton
            size="sm"
            variant="dangerGhost"
            ariaLabel="Удалить виджет Следующая задача"
            icon={<FaTrash />}
            onClick={onDeleteClick}
          />
        )}
      </div>
      {next ? (
        <>
          <p className="truncate" title={next.title}>
            {next.title}
          </p>
          <p className="text-xs text-gray-400">
            {[next.scheduledTime, formatTaskDuration(next.durationMin)].filter(Boolean).join(' · ')}
          </p>
          {onDeleteClick && (
            <Button size="sm" onClick={() => startFocus?.(day, next)}>
              Начать фокус
            </Button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">
          {planDay?.tasks.length ? 'Все задачи дня выполнены' : 'На этот день пока нет задач'}
        </p>
      )}
    </section>
  );
}
