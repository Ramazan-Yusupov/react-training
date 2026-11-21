import { useMemo, useState } from 'react';
import { usePlanStore } from '@/entities/plan';
import type { PlanTask } from '@/entities/plan';
import { Button, Checkbox, IconButton, Input, Modal } from '@/shared/ui';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

type EditorMode = 'add' | 'edit' | 'delete' | 'all-scope' | null;

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

  const templateDays = usePlanStore((state) => state.template.days);
  const dayOverrides = usePlanStore((state) => state.dayOverrides);

  const [mode, setMode] = useState<EditorMode>(null);
  const [title, setTitle] = useState(task?.title ?? '');
  const [durationMin, setDurationMin] = useState(String(task?.durationMin ?? 5));
  const [xp, setXp] = useState(String(task?.xp ?? 5));
  const [required, setRequired] = useState(task?.required ?? true);
  const [error, setError] = useState('');

  const isAddOpen = (open ?? mode === 'add') && mode !== 'all-scope';

  const missingGroupDays = useMemo(() => {
    if (!groupId) return [];

    return templateDays
      .filter((templateDay) => {
        const current = dayOverrides[String(templateDay.day)] ?? templateDay;

        return !current.groups.some((group) => group.id === groupId);
      })
      .map((item) => item.day);
  }, [templateDays, dayOverrides, groupId]);

  const taskGroupId = groupId ?? null;

  const taskCount = currentDay?.tasks.filter((item) => item.groupId === taskGroupId).length ?? 0;

  const isLimitReached = groupId !== undefined && taskCount >= 10;

  const close = () => {
    setMode(null);
    setTitle(task?.title ?? '');
    setDurationMin(String(task?.durationMin ?? 5));
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

    if (!Number.isInteger(points) || points < 0 || points > 10000) {
      setError('XP должно быть целым числом от 0 до 10000.');
      return null;
    }

    return {
      title: normalizedTitle,
      durationMin: duration,
      xp: points,
      required,
    };
  };

  const handleAdd = (scope: 'day' | 'all') => {
    const values = validate();

    if (!values) return;

    if (scope === 'all' && groupId && missingGroupDays.length > 0) {
      setMode('all-scope');
      return;
    }

    const result = addTask(day, taskGroupId, values, scope);

    if (!result) {
      setError(
        scope === 'all'
          ? 'В одной из карточек уже достигнут лимит в 10 задач.'
          : 'В этой карточке уже есть 10 задач.',
      );
      return;
    }

    close();
  };

  const handleAddToAllDays = () => {
    const values = validate();

    if (!values || !groupId) return;

    const result = addTaskToAllDaysWithGroup(day, groupId, values);

    if (!result) {
      setError(
        'Не удалось добавить задачу. Возможно, в одной из карточек достигнут лимит в 10 задач.',
      );
      setMode('add');
      return;
    }

    close();
  };

  const handleAddToExistingGroups = () => {
    const values = validate();

    if (!values || !groupId) return;

    const result = addTask(day, groupId, values, 'all');

    if (!result) {
      setError('Не удалось добавить задачу. Проверь лимит задач.');
      setMode('add');
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

      <div className="grid grid-cols-2 gap-3">
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
          label="Награда (XP)"
          type="number"
          min={0}
          max={10000}
          value={xp}
          onChange={(event) => {
            setXp(event.target.value);
            setError('');
          }}
        />
      </div>

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

        <Modal
          open={mode === 'all-scope'}
          onClose={close}
          title="Карточка есть не во всех днях"
          size="lg"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-300">Карточка отсутствует в следующих днях:</p>

            <p className="text-sm text-amber-400">{missingGroupDays.join(', ')}</p>

            <p className="text-sm text-gray-300">Как поступить с задачей?</p>

            <Button
              variant="primary"
              fullWidth
              disabled={!title.trim()}
              onClick={handleAddToAllDays}
            >
              Создать карточку в недостающих днях и добавить задачу
            </Button>

            <Button
              variant="outline"
              fullWidth
              disabled={!title.trim()}
              onClick={handleAddToExistingGroups}
            >
              Добавить только в дни с этой карточкой
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
            setXp(String(task.xp));
            setRequired(task.required);
            setMode('edit');
          }}
        />

        <IconButton
          size="sm"
          variant="ghost"
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

          <Button variant="outline" fullWidth onClick={() => handleDelete('all')}>
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
