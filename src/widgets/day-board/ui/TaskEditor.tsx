import { useState } from 'react';

import { usePlanStore } from '@/entities/plan';
import type { PlanTask } from '@/entities/plan';

import { Button, Checkbox, IconButton, Input, Modal } from '@/shared/ui';

import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

type EditorMode = 'add' | 'edit' | 'delete' | null;

const MAX_TASK_XP = 999;

interface TaskEditorProps {
  day: number;
  groupId?: string;
  task?: PlanTask;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function TaskEditor({
  day,
  groupId,
  task,
  open,
  onOpenChange,
  hideTrigger = false,
}: TaskEditorProps) {
  const addTask = usePlanStore((state) => state.addTask);
  const addTaskToAllDaysWithGroup = usePlanStore((state) => state.addTaskToAllDaysWithGroup);
  const updateTask = usePlanStore((state) => state.updateTask);
  const deleteTask = usePlanStore((state) => state.deleteTask);

  const currentDay = usePlanStore(
    (state) =>
      state.dayOverrides[String(day)] ?? state.template.days.find((item) => item.day === day),
  );

  const [mode, setMode] = useState<EditorMode>(null);
  const [title, setTitle] = useState(task?.title ?? '');
  const [durationMin, setDurationMin] = useState(String(task?.durationMin ?? 5));
  const [scheduledTime, setScheduledTime] = useState(task?.scheduledTime ?? '');
  const [xp, setXp] = useState(String(task?.xp ?? 5));
  const [required, setRequired] = useState(task?.required ?? true);
  const [error, setError] = useState('');

  const isAddOpen = open ?? mode === 'add';
  const taskGroupId = groupId ?? null;

  const taskCount = currentDay?.tasks.filter((item) => item.groupId === taskGroupId).length ?? 0;
  const isLimitReached = groupId !== undefined && taskCount >= 10;

  const close = () => {
    setMode(null);
    setTitle(task?.title ?? '');
    setDurationMin(String(task?.durationMin ?? 5));
    setScheduledTime(task?.scheduledTime ?? '');
    setXp(String(task?.xp ?? 5));
    setRequired(task?.required ?? true);
    setError('');
    onOpenChange?.(false);
  };

  const validate = () => {
    const normalizedTitle = title.trim();
    const duration = Number(durationMin);
    const points = Number(xp);

    if (!normalizedTitle) {
      setError('Введите название задачи.');
      return null;
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setError('Длительность должна быть от 1 до 1440 минут.');
      return null;
    }

    if (!Number.isInteger(points) || points < 0 || points > MAX_TASK_XP) {
      setError(`XP должно быть целым числом от 0 до ${MAX_TASK_XP}.`);
      return null;
    }

    return {
      title: normalizedTitle,
      durationMin: duration,
      scheduledTime: scheduledTime || undefined,
      xp: points,
      required,
    };
  };

  const handleAdd = (scope: 'day' | 'all') => {
    const values = validate();

    if (!values) return;

    let result: string | null;

    if (scope === 'all' && groupId) {
      result = addTaskToAllDaysWithGroup(day, groupId, values);
    } else {
      result = addTask(day, taskGroupId, values, scope);
    }

    if (!result) {
      setError(
        scope === 'all'
          ? 'Не удалось добавить задачу во все дни. Проверь лимит в 10 задач в карточке.'
          : 'В этой карточке уже есть 10 задач.',
      );
      return;
    }

    close();
  };

  const handleUpdate = (scope: 'day' | 'all') => {
    if (!task) return;

    const values = validate();

    if (!values) return;

    updateTask(day, task.id, values, scope);
    close();
  };

  const handleDelete = (scope: 'day' | 'all') => {
    if (!task) return;

    deleteTask(day, task.id, scope);
    close();
  };

  const renderFields = () => (
    <>
      <Input
        label="Название задачи"
        placeholder="Например, Прочитать главу книги"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setError('');
        }}
        maxLength={100}
        autoFocus
      />

      <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
        <Input
          label="Длительность (мин)"
          type="number"
          min={1}
          max={1440}
          value={durationMin}
          onChange={(event) => {
            setDurationMin(event.target.value);
            setError('');
          }}
        />

        <Input
          label="Время начала"
          type="time"
          value={scheduledTime}
          onChange={(event) => {
            setScheduledTime(event.target.value);
            setError('');
          }}
        />
      </div>

      <Input
        label="Награда (XP)"
        type="number"
        min={0}
        max={MAX_TASK_XP}
        value={xp}
        onChange={(event) => {
          setXp(event.target.value);
          setError('');
        }}
      />

      <Checkbox
        checked={required}
        onChange={(event) => setRequired(event.target.checked)}
        label="Обязательная задача"
        description="Учитывать задачу как обязательную в плане"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </>
  );

  if (!task) {
    return (
      <>
        {!hideTrigger && (
          <Button
            size="sm"
            variant={groupId ? 'ghost' : 'outline'}
            icon={<FaPlus />}
            disabled={isLimitReached}
            onClick={() => setMode('add')}
          >
            {groupId
              ? isLimitReached
                ? 'Лимит задач достигнут'
                : `Добавить задачу (${taskCount}/10)`
              : 'Добавить задачу без карточки'}
          </Button>
        )}

        <Modal open={isAddOpen} onClose={close} title="Новая задача" size="lg">
          {renderFields()}

          <p className="text-sm text-gray-400">Где создать задачу?</p>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              fullWidth
              disabled={!title.trim()}
              onClick={() => handleAdd('day')}
            >
              Только день {day}
            </Button>

            <Button
              variant="outline"
              fullWidth
              disabled={!title.trim()}
              onClick={() => handleAdd('all')}
            >
              Во всех днях
            </Button>

            <Button variant="ghost" fullWidth onClick={close}>
              Отмена
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          size="sm"
          variant="ghost"
          ariaLabel={`Редактировать задачу ${task.title}`}
          icon={<FaPen />}
          onClick={() => {
            setTitle(task.title);
            setDurationMin(String(task.durationMin));
            setScheduledTime(task.scheduledTime ?? '');
            setXp(String(task.xp));
            setRequired(task.required);
            setError('');
            setMode('edit');
          }}
        />

        <IconButton
          size="sm"
          variant="dangerGhost"
          ariaLabel={`Удалить задачу ${task.title}`}
          icon={<FaTrash />}
          onClick={() => setMode('delete')}
        />
      </div>

      <Modal open={mode === 'edit'} onClose={close} title="Редактировать задачу" size="lg">
        {renderFields()}

        <p className="text-sm text-gray-400">Где применить изменения?</p>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            disabled={!title.trim()}
            onClick={() => handleUpdate('day')}
          >
            Только день {day}
          </Button>

          <Button
            variant="outline"
            fullWidth
            disabled={!title.trim()}
            onClick={() => handleUpdate('all')}
          >
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal open={mode === 'delete'} onClose={close} title="Удалить задачу?">
        <p className="text-sm text-gray-300">
          Задача «{task.title}» будет удалена из выбранной области.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => handleDelete('day')}>
            Только день {day}
          </Button>

          <Button variant="dangerOutline" fullWidth onClick={() => handleDelete('all')}>
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
